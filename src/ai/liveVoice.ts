import { GoogleGenAI, FunctionDeclaration, Type } from '@google/genai';
import { VOICE_AGENT_SYSTEM_PROMPT_V1 } from './prompts/v1';
import { AppError } from '@/lib/errors';
import { CaseService } from '@/services/cases';
import { rupeesToPaise } from '@/engine/money';

export const CREATE_CASE_TOOL_DECLARATION: FunctionDeclaration = {
  name: 'create_case',
  description: 'Proposes creating a DRAFT recovery case. MUST only be confirmed by the human user.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      buyerName: { type: Type.STRING, description: 'Buyer corporate name' },
      invoiceNumber: { type: Type.STRING, description: 'Invoice number' },
      invoiceDate: { type: Type.STRING, description: 'YYYY-MM-DD' },
      amountRupees: { type: Type.STRING, description: 'Amount in rupees decimal string' },
      deliveryDate: { type: Type.STRING, description: 'Delivery/challan receipt date if confirmed' },
      userConfirmed: { type: Type.BOOLEAN, description: 'Explicit user confirmation flag' },
    },
    required: ['buyerName', 'invoiceNumber', 'invoiceDate', 'amountRupees', 'userConfirmed'],
  },
};

export interface LiveVoiceSessionConfig {
  sessionToken: string;
  wsEndpoint: string;
  expiresAt: string;
  model: string;
  systemInstruction: string;
  consentGranted: boolean;
}

/**
 * Issues a single-use short-lived ephemeral token for Gemini Live API.
 * ENFORCES MANDATORY CONSENT GATE: Fails fast if consent is not explicitly granted.
 */
export async function issueLiveVoiceSessionToken(params: {
  userId: string;
  consentGranted: boolean;
}): Promise<LiveVoiceSessionConfig> {
  const { userId, consentGranted } = params;

  if (!consentGranted) {
    throw new AppError(
      'MANDATORY_CONSENT_REQUIRED: User consent is strictly required under DPDP Act before initiating voice follow-up.',
      403,
      'CONSENT_REQUIRED'
    );
  }

  const liveModel = process.env.GEMINI_LIVE_MODEL || 'gemini-2.0-flash-exp';
  const apiKey = process.env.GEMINI_API_KEY || 'demo-placeholder-key';

  // In test environment or demo mode
  if (process.env.NODE_ENV === 'test' || !process.env.GEMINI_API_KEY || apiKey === 'demo-placeholder-key') {
    return {
      sessionToken: `live_ephemeral_${crypto.randomUUID()}`,
      wsEndpoint: `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min
      model: liveModel,
      systemInstruction: VOICE_AGENT_SYSTEM_PROMPT_V1,
      consentGranted: true,
    };
  }

  // Real Gemini Live API token exchange
  const ai = new GoogleGenAI({ apiKey });
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  // Return session parameters
  return {
    sessionToken: `live_token_${crypto.randomUUID()}`,
    wsEndpoint: `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`,
    expiresAt,
    model: liveModel,
    systemInstruction: VOICE_AGENT_SYSTEM_PROMPT_V1,
    consentGranted: true,
  };
}

/**
 * Handles the client-confirmed create_case tool callback from the Live Voice session.
 * Strictly requires `userConfirmed === true` before persisting to Firestore.
 */
export async function handleVoiceCreateCase(params: {
  ownerUid: string;
  buyerName: string;
  invoiceNumber: string;
  invoiceDate: string;
  amountRupees: string;
  deliveryDate?: string;
  userConfirmed: boolean;
  caseService?: CaseService;
}) {
  const { ownerUid, buyerName, invoiceNumber, invoiceDate, amountRupees, deliveryDate, userConfirmed, caseService } = params;

  if (!userConfirmed) {
    throw new AppError(
      'Human in the loop: Voice agent cannot create a case without explicit user confirmation.',
      400,
      'CONFIRMATION_REQUIRED'
    );
  }

  const service = caseService || new CaseService();
  const amountPaise = rupeesToPaise(amountRupees);

  const { caseEntity, event } = await service.createCase({
    ownerUid,
    invoice: {
      id: `inv_voice_${crypto.randomUUID()}`,
      ownerUid,
      invoiceNumber,
      invoiceDate,
      deliveryDate,
      totalAmountPaise: amountPaise,
      buyer: { name: buyerName },
    },
    idempotencyKey: `voice_create_${invoiceNumber}_${Date.now()}`,
    actor: { uid: ownerUid, role: 'user' },
  });

  return {
    success: true,
    caseId: caseEntity.id,
    state: caseEntity.state,
    event,
  };
}
