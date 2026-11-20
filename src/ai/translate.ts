import { GoogleGenAI } from '@google/genai';
import { TRANSLATION_SYSTEM_PROMPT_V1 } from './prompts/v1';

export type TranslationLanguage = 'hi' | 'gu';

export interface TranslationResult {
  translatedText: string;
  sourceText: string;
  targetLanguage: TranslationLanguage;
  integrityVerified: boolean;
  mismatchedTokens?: {
    expected: string[];
    received: string[];
  };
}

/**
 * Extracts all critical statutory tokens:
 * - Dates (YYYY-MM-DD or DD/MM/YYYY)
 * - GSTINs (15-char)
 * - Decimal numbers & amounts (e.g. 100000, 6.75, 20.25)
 * - Integers (e.g. 15, 45, 2024)
 */
export function extractCriticalTokens(text: string): string[] {
  const tokens: string[] = [];

  // 1. Extract GSTINs
  const gstinMatches = text.match(/[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}/g) || [];
  gstinMatches.forEach((g) => tokens.push(g));

  // 2. Extract ISO Dates (YYYY-MM-DD)
  const dateMatches = text.match(/\b\d{4}-\d{2}-\d{2}\b/g) || [];
  dateMatches.forEach((d) => tokens.push(d));

  // 3. Extract all numeric values and amounts
  const numberMatches = text.match(/\b\d+(?:[.,]\d+)*\b/g) || [];
  numberMatches.forEach((n) => {
    const cleanNum = n.replace(/,/g, '');
    tokens.push(cleanNum);
  });

  return tokens.sort();
}

/**
 * Computes frequency map (multiset) of strings.
 */
export function buildMultiset(tokens: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const token of tokens) {
    map.set(token, (map.get(token) || 0) + 1);
  }
  return map;
}

/**
 * Checks whether two token arrays form an exact multiset match.
 */
export function verifyExactMultisetMatch(
  sourceTokens: string[],
  targetTokens: string[]
): { matches: boolean; missingInTarget: string[]; extraInTarget: string[] } {
  const sourceMap = buildMultiset(sourceTokens);
  const targetMap = buildMultiset(targetTokens);

  const missingInTarget: string[] = [];
  const extraInTarget: string[] = [];

  sourceMap.forEach((count, token) => {
    const targetCount = targetMap.get(token) || 0;
    if (targetCount < count) {
      for (let i = 0; i < count - targetCount; i++) {
        missingInTarget.push(token);
      }
    }
  });

  targetMap.forEach((count, token) => {
    const sourceCount = sourceMap.get(token) || 0;
    if (count > sourceCount) {
      for (let i = 0; i < count - sourceCount; i++) {
        extraInTarget.push(token);
      }
    }
  });

  return {
    matches: missingInTarget.length === 0 && extraInTarget.length === 0,
    missingInTarget,
    extraInTarget,
  };
}

/**
 * Translates a code-rendered statutory notice to Hindi or Gujarati with strict multiset token validation.
 * On ANY token mismatch or altered digit, discards translation and falls back to original template.
 */
export async function translateNoticeWithIntegrity(
  sourceNoticeEn: string,
  targetLang: TranslationLanguage
): Promise<TranslationResult> {
  const sourceTokens = extractCriticalTokens(sourceNoticeEn);

  // Deterministic mock in test environment
  if (
    process.env.NODE_ENV === 'test' ||
    !process.env.GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY === 'demo-placeholder-key'
  ) {
    // Produce mock translated text containing identical critical tokens
    const sampleTranslated = targetLang === 'hi'
      ? `कानूनी मांग सूचना:\n\n${sourceNoticeEn}\n\nकेवल ड्राफ्ट। भेजने से पहले सीए/वकील से समीक्षा करवाएं।`
      : `કાનૂની માંગ નોટિસ:\n\n${sourceNoticeEn}\n\nમાત્ર ડ્રાફ્ટ. મોકલતા પહેલા CA/વકીલ સાથે સમીક્ષા કરો.`;

    const targetTokens = extractCriticalTokens(sampleTranslated);
    const verification = verifyExactMultisetMatch(sourceTokens, targetTokens);

    return {
      translatedText: verification.matches ? sampleTranslated : sourceNoticeEn,
      sourceText: sourceNoticeEn,
      targetLanguage: targetLang,
      integrityVerified: verification.matches,
    };
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const langLabel = targetLang === 'hi' ? 'Hindi' : 'Gujarati';
  const prompt = `${TRANSLATION_SYSTEM_PROMPT_V1}\n\nTarget Language: ${langLabel}\n\nOriginal Notice to Translate:\n${sourceNoticeEn}`;

  try {
    const res = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.1,
      },
    });

    const translatedCandidate = res.text || '';
    const targetTokens = extractCriticalTokens(translatedCandidate);

    const verification = verifyExactMultisetMatch(sourceTokens, targetTokens);

    if (!verification.matches) {
      console.warn(`[TRANSLATION_INTEGRITY_FAILED] Discarding translation due to multiset mismatch. Missing: ${verification.missingInTarget.join(', ')}. Extra: ${verification.extraInTarget.join(', ')}`);
      return {
        translatedText: sourceNoticeEn, // Fallback to safe source
        sourceText: sourceNoticeEn,
        targetLanguage: targetLang,
        integrityVerified: false,
        mismatchedTokens: {
          expected: verification.missingInTarget,
          received: verification.extraInTarget,
        },
      };
    }

    return {
      translatedText: translatedCandidate,
      sourceText: sourceNoticeEn,
      targetLanguage: targetLang,
      integrityVerified: true,
    };
  } catch (err: unknown) {
    console.warn(`[TRANSLATION_API_ERROR] ${err instanceof Error ? err.message : String(err)}, using source template`);
    return {
      translatedText: sourceNoticeEn,
      sourceText: sourceNoticeEn,
      targetLanguage: targetLang,
      integrityVerified: false,
    };
  }
}
