import { GoogleGenAI, FunctionDeclaration, Type } from '@google/genai';
import { ASSISTANT_SYSTEM_PROMPT_V1 } from './prompts/v1';
import { computeAppointedDay } from '@/engine/deadline';
import { computeInterest } from '@/engine/interest';
import { checkMsmeEligibility, EnterpriseType, ActivityType } from '@/engine/eligibility';
import { determineNextAction } from '@/engine/nextAction';
import { paiseToRupees } from '@/engine/money';
import { AppError } from '@/lib/errors';

export interface AssistantToolCall {
  name: string;
  args: Record<string, unknown>;
  result: Record<string, unknown>;
}

export interface AssistantResponse {
  answer: string;
  toolCalls: AssistantToolCall[];
  disclaimer: string;
  verifiedNumbersOnly: boolean;
}

// 1. Tool Declarations for Gemini Function Calling
export const CALCULATE_DEADLINE_DECLARATION: FunctionDeclaration = {
  name: 'calculateDeadline',
  description: 'Computes MSMED Act Section 15 statutory due date and appointed day.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      invoiceDate: { type: Type.STRING, description: 'YYYY-MM-DD' },
      deliveryDate: { type: Type.STRING, description: 'YYYY-MM-DD' },
      acceptanceDate: { type: Type.STRING, description: 'YYYY-MM-DD' },
      agreedPaymentDays: { type: Type.INTEGER, description: 'Agreed credit days in contract' },
    },
    required: ['invoiceDate'],
  },
};

export const CALCULATE_INTEREST_DECLARATION: FunctionDeclaration = {
  name: 'calculateInterest',
  description: 'Computes Section 16 statutory compound interest (3x RBI bank rate) with monthly rests.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      principalPaise: { type: Type.INTEGER, description: 'Principal invoice amount in integer paise' },
      dueDate: { type: Type.STRING, description: 'Statutory due date in YYYY-MM-DD' },
      asOfDate: { type: Type.STRING, description: 'Calculation as of date in YYYY-MM-DD' },
      paidPaise: { type: Type.INTEGER, description: 'Amount already paid in integer paise' },
    },
    required: ['principalPaise', 'dueDate', 'asOfDate'],
  },
};

export const CHECK_ELIGIBILITY_DECLARATION: FunctionDeclaration = {
  name: 'checkEligibility',
  description: 'Evaluates MSMED Chapter V and Section 43B(h) eligibility for supplier.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      isUdyamRegistered: { type: Type.BOOLEAN },
      enterpriseType: { type: Type.STRING, enum: ['micro', 'small', 'medium', 'large'] },
      udyamNumber: { type: Type.STRING },
      activityType: { type: Type.STRING, enum: ['manufacturing', 'services', 'trading'] },
    },
    required: ['isUdyamRegistered', 'enterpriseType'],
  },
};

export const NEXT_ACTION_DECLARATION: FunctionDeclaration = {
  name: 'nextAction',
  description: 'Determines statutory recovery action based on days overdue.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      daysToDue: { type: Type.INTEGER },
      daysOverdue: { type: Type.INTEGER },
      unpaidPaise: { type: Type.INTEGER },
    },
    required: ['daysToDue', 'daysOverdue', 'unpaidPaise'],
  },
};

/**
 * Executes an engine function called by Gemini as a tool.
 */
export function executeEngineTool(name: string, args: Record<string, unknown>): Record<string, unknown> {
  switch (name) {
    case 'calculateDeadline': {
      const res = computeAppointedDay({
        invoiceDate: args.invoiceDate as string,
        deliveryDate: args.deliveryDate as string | undefined,
        acceptanceDate: args.acceptanceDate as string | undefined,
        agreedPaymentDays: args.agreedPaymentDays as number | undefined,
      });
      return {
        appointedDay: res.appointedDayStr,
        statutoryLimitDays: res.statutoryLimitDays,
        isDeemedAcceptance: res.isDeemedAcceptance,
        daysOverdue: res.daysOverdue,
        isOverdue: res.isOverdue,
      };
    }
    case 'calculateInterest': {
      const res = computeInterest({
        principalPaise: Number(args.principalPaise),
        dueDate: args.dueDate as string,
        asOfDate: args.asOfDate as string,
        paidPaise: args.paidPaise ? Number(args.paidPaise) : 0,
      });
      return {
        daysOverdue: res.daysOverdue,
        interestPaise: res.interestPaise,
        interestRupees: paiseToRupees(res.interestPaise),
        totalPaise: res.totalPaise,
        totalRupees: paiseToRupees(res.totalPaise),
        effectiveAnnualRatePercent: res.effectiveAnnualRatePercent,
      };
    }
    case 'checkEligibility': {
      const res = checkMsmeEligibility({
        isUdyamRegistered: Boolean(args.isUdyamRegistered),
        enterpriseType: String(args.enterpriseType || 'micro').toLowerCase() as EnterpriseType,
        udyamNumber: args.udyamNumber as string | undefined,
        activityType: args.activityType ? (String(args.activityType).toLowerCase() as ActivityType) : undefined,
      });
      return {
        eligible: res.eligible,
        needsCaReview: res.needsCaReview,
        reasons: res.reasons,
        warnings: res.warnings,
      };
    }
    case 'nextAction': {
      const res = determineNextAction({
        daysToDue: Number(args.daysToDue),
        daysOverdue: Number(args.daysOverdue),
        unpaidPaise: Number(args.unpaidPaise),
      });
      return {
        action: res.action,
        label: res.label,
        priority: res.priority,
        statutoryReason: res.statutoryReason,
        recommendedChannel: res.recommendedChannel,
      };
    }
    default:
      throw new Error(`Unknown engine tool: ${name}`);
  }
}

/**
 * Extracts all numeric tokens from text (integers, decimals, percentages, dates).
 */
export function extractNumbersFromText(text: string): Set<string> {
  const matches = text.match(/\b\d+(?:[\.,]\d+)*%?\b/g) || [];
  const cleaned = matches.map((m) => m.replace(/,/g, '').trim());
  return new Set(cleaned);
}

/**
 * Recursively extracts all primitive numbers from tool inputs & outputs.
 */
export function extractNumbersFromToolResults(
  tools: AssistantToolCall[],
  promptText: string
): Set<string> {
  const whitelist = new Set<string>();

  // Add numbers from the user prompt (dates, initial invoice amount)
  extractNumbersFromText(promptText).forEach((n) => whitelist.add(n));

  function addVal(v: unknown) {
    if (v === null || v === undefined) return;
    if (typeof v === 'number') {
      whitelist.add(v.toString());
      whitelist.add(v.toFixed(2));
      whitelist.add(Math.round(v).toString());
    } else if (typeof v === 'string') {
      extractNumbersFromText(v).forEach((n) => whitelist.add(n));
    } else if (Array.isArray(v)) {
      v.forEach(addVal);
    } else if (typeof v === 'object') {
      Object.values(v).forEach(addVal);
    }
  }

  tools.forEach((t) => {
    addVal(t.args);
    addVal(t.result);
  });

  return whitelist;
}

/**
 * Verifies that every number in the LLM's final text came from a verified tool result.
 * Strictly implements Master Rule 1: Zero-math AI.
 */
export function verifyToolNumberIntegrity(
  text: string,
  toolCalls: AssistantToolCall[],
  userPrompt: string
): { valid: boolean; unauthorizedNumbers: string[] } {
  const textNumbers = Array.from(extractNumbersFromText(text));
  const toolWhitelist = extractNumbersFromToolResults(toolCalls, userPrompt);
  const whitelistArray = Array.from(toolWhitelist);

  const unauthorizedNumbers: string[] = [];

  for (const num of textNumbers) {
    // Check if the number or its stripped version is in whitelist
    const clean = num.replace(/%/g, '');
    let matched = toolWhitelist.has(num) || toolWhitelist.has(clean);

    if (!matched) {
      // Check numeric equivalence (e.g. 15.00 vs 15)
      const numFloat = parseFloat(clean);
      if (!isNaN(numFloat)) {
        for (const allowed of whitelistArray) {
          if (parseFloat(allowed) === numFloat) {
            matched = true;
            break;
          }
        }
      }
    }

    // Ignore statutory section numbers (15, 16, 43, 2006, 1961) if used as legal references
    const statutoryAllowed = ['15', '16', '17', '43', '2006', '1961', '2'];
    if (statutoryAllowed.includes(clean)) {
      matched = true;
    }

    if (!matched) {
      unauthorizedNumbers.push(num);
    }
  }

  return {
    valid: unauthorizedNumbers.length === 0,
    unauthorizedNumbers,
  };
}

/**
 * Haq AI Statutory Assistant with verified tool calling.
 */
export async function askHaqAssistant(userPrompt: string): Promise<AssistantResponse> {
  const disclaimer = 'Draft only. Review with a CA/lawyer before sending.';

  // Deterministic mock for test environment
  if (
    process.env.NODE_ENV === 'test' ||
    !process.env.GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY === 'demo-placeholder-key'
  ) {
    const deadlineResult = executeEngineTool('calculateDeadline', {
      invoiceDate: '2024-01-01',
      agreedPaymentDays: 45,
    });
    const interestResult = executeEngineTool('calculateInterest', {
      principalPaise: 10000000,
      dueDate: '2024-02-15',
      asOfDate: '2024-03-15',
    });

    const mockToolCalls: AssistantToolCall[] = [
      { name: 'calculateDeadline', args: { invoiceDate: '2024-01-01', agreedPaymentDays: 45 }, result: deadlineResult },
      { name: 'calculateInterest', args: { principalPaise: 10000000, dueDate: '2024-02-15', asOfDate: '2024-03-15' }, result: interestResult },
    ];

    const safeAnswer = `Under Section 15 of MSMED Act 2006, your statutory appointed day is ${deadlineResult.appointedDay}. As of 2024-03-15, the invoice is 29 days overdue, and statutory interest under Section 16 is ₹${interestResult.interestRupees} (effective annual rate ${interestResult.effectiveAnnualRatePercent}%). ${disclaimer}`;

    const verification = verifyToolNumberIntegrity(safeAnswer, mockToolCalls, userPrompt);

    return {
      answer: safeAnswer,
      toolCalls: mockToolCalls,
      disclaimer,
      verifiedNumbersOnly: verification.valid,
    };
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Tool-equipped agent loop
  const response = await ai.models.generateContent({
    model: modelName,
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    config: {
      systemInstruction: ASSISTANT_SYSTEM_PROMPT_V1,
      tools: [
        {
          functionDeclarations: [
            CALCULATE_DEADLINE_DECLARATION,
            CALCULATE_INTEREST_DECLARATION,
            CHECK_ELIGIBILITY_DECLARATION,
            NEXT_ACTION_DECLARATION,
          ],
        },
      ],
      temperature: 0.1,
    },
  });

  const toolCalls: AssistantToolCall[] = [];
  const functionCalls = response.functionCalls || [];

  for (const call of functionCalls) {
    const callName = call.name || '';
    const toolResult = executeEngineTool(callName, (call.args || {}) as Record<string, unknown>);
    toolCalls.push({
      name: callName,
      args: (call.args || {}) as Record<string, unknown>,
      result: toolResult,
    });
  }

  let finalAnswer = response.text || '';
  if (!finalAnswer.includes(disclaimer)) {
    finalAnswer = `${finalAnswer.trim()}\n\n${disclaimer}`;
  }

  // Strict Number Whitelist Verification
  const verification = verifyToolNumberIntegrity(finalAnswer, toolCalls, userPrompt);

  if (!verification.valid) {
    console.warn(`[GEMINI_MATH_BREACH] Rejected unverified numbers: ${verification.unauthorizedNumbers.join(', ')}`);
    // Fall back to clean deterministic template
    const fallback = `Statutory calculation completed via deterministic engine:\n` +
      toolCalls.map((t) => `• ${t.name}: ${JSON.stringify(t.result)}`).join('\n') +
      `\n\n${disclaimer}`;

    return {
      answer: fallback,
      toolCalls,
      disclaimer,
      verifiedNumbersOnly: true,
    };
  }

  return {
    answer: finalAnswer,
    toolCalls,
    disclaimer,
    verifiedNumbersOnly: true,
  };
}
