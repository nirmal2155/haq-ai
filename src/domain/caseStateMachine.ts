import crypto from 'crypto';
import { Case, CaseEvent, CaseEventType, CaseState, Actor } from './types';
import { AppError } from '@/lib/errors';

export class IllegalStateTransitionError extends AppError {
  public readonly fromState: CaseState;
  public readonly toState: CaseState;

  constructor(fromState: CaseState, toState: CaseState, reason?: string) {
    const message = `Illegal case transition from ${fromState} to ${toState}${reason ? `: ${reason}` : ''}`;
    super(message, 422, 'ILLEGAL_STATE_TRANSITION', { fromState, toState });
    this.name = 'IllegalStateTransitionError';
    this.fromState = fromState;
    this.toState = toState;
  }
}

/**
 * Strict state transition matrix for Haq AI cases.
 */
export const ALLOWED_TRANSITIONS: Record<CaseState, readonly CaseState[]> = {
  DRAFT: ['ELIGIBILITY_CHECKED', 'INELIGIBLE', 'CLOSED'],
  ELIGIBILITY_CHECKED: ['TRACKING', 'INELIGIBLE', 'CLOSED'],
  TRACKING: ['REMINDER_DUE', 'NOTICE_DRAFTED', 'PAID', 'CLOSED'],
  REMINDER_DUE: ['REMINDER_APPROVED', 'PAID', 'CLOSED'],
  REMINDER_APPROVED: ['REMINDER_SENT', 'PAID', 'CLOSED'],
  REMINDER_SENT: ['TRACKING', 'NOTICE_DRAFTED', 'PAID', 'CLOSED'],
  NOTICE_DRAFTED: ['NOTICE_SENT_BY_USER', 'PAID', 'CLOSED'],
  NOTICE_SENT_BY_USER: ['TRACKING', 'PAID', 'CLOSED'],
  PAID: ['CLOSED'],
  INELIGIBLE: ['CLOSED'],
  CLOSED: [], // Terminal state: no outbound transitions permitted
};

/**
 * Checks whether a transition between two states is permitted.
 */
export function canTransition(from: CaseState, to: CaseState): boolean {
  const allowed = ALLOWED_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

/**
 * Computes a deterministic SHA-256 hash of non-PII metadata.
 * Strictly guarantees that no PII (names, phone numbers, raw GSTINs) is stored unhashed.
 */
export function computeNonPiiPayloadHash(data: {
  caseId: string;
  fromState: CaseState | null;
  toState: CaseState;
  timestamp: string;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
}): string {
  // Extract strictly non-PII structural identifiers
  const safePayload = {
    caseId: data.caseId,
    fromState: data.fromState,
    toState: data.toState,
    timestamp: data.timestamp,
    idempotencyKey: data.idempotencyKey,
    hasMetadata: Boolean(data.metadata && Object.keys(data.metadata).length > 0),
  };

  return crypto.createHash('sha256').update(JSON.stringify(safePayload)).digest('hex');
}

export interface TransitionCommand {
  caseEntity: Case;
  toState: CaseState;
  eventType: CaseEventType;
  actor: Actor;
  idempotencyKey: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
  stateUpdates?: Partial<Omit<Case, 'id' | 'ownerUid' | 'state' | 'lastIdempotencyKey' | 'createdAt'>>;
}

export interface TransitionResult {
  updatedCase: Case;
  event: CaseEvent;
  isIdempotentReplay: boolean;
}

/**
 * Executes a typed state transition on a Case entity.
 * - Enforces allowed transitions according to ALLOWED_TRANSITIONS.
 * - Idempotency: If the case has already processed this exact idempotencyKey to the same target state,
 *   returns the existing case state without creating duplicate events.
 * - Produces an immutable, append-only CaseEvent with a SHA-256 non-PII payload hash.
 */
export function transitionCase(command: TransitionCommand): TransitionResult {
  const { caseEntity, toState, eventType, actor, idempotencyKey, stateUpdates = {} } = command;

  // 1. Check for Idempotency Replay
  if (caseEntity.lastIdempotencyKey === idempotencyKey) {
    if (caseEntity.state === toState) {
      // Return existing state without creating duplicate event
      const dummyEvent: CaseEvent = {
        id: `evt_replay_${idempotencyKey}`,
        caseId: caseEntity.id,
        actor,
        type: eventType,
        fromState: caseEntity.state,
        toState,
        timestamp: caseEntity.updatedAt,
        payloadHash: computeNonPiiPayloadHash({
          caseId: caseEntity.id,
          fromState: caseEntity.state,
          toState,
          timestamp: caseEntity.updatedAt,
          idempotencyKey,
          metadata: command.metadata,
        }),
        idempotencyKey,
        metadata: { ...command.metadata, isReplay: true },
      };

      return {
        updatedCase: caseEntity,
        event: dummyEvent,
        isIdempotentReplay: true,
      };
    } else {
      throw new AppError(
        `Idempotency conflict: Key "${idempotencyKey}" already used with state "${caseEntity.state}", cannot transition to "${toState}"`,
        409,
        'IDEMPOTENCY_CONFLICT'
      );
    }
  }

  // 2. Validate Allowed Transition
  if (!canTransition(caseEntity.state, toState)) {
    throw new IllegalStateTransitionError(
      caseEntity.state,
      toState,
      `State ${caseEntity.state} does not permit transitioning to ${toState}. Allowed: [${ALLOWED_TRANSITIONS[caseEntity.state].join(', ')}]`
    );
  }

  const now = command.timestamp || new Date().toISOString();
  const eventId = `evt_${crypto.randomUUID()}`;

  // 3. Generate Non-PII Payload Hash for Event
  const payloadHash = computeNonPiiPayloadHash({
    caseId: caseEntity.id,
    fromState: caseEntity.state,
    toState,
    timestamp: now,
    idempotencyKey,
    metadata: command.metadata,
  });

  // 4. Construct Append-Only Event
  const event: CaseEvent = {
    id: eventId,
    caseId: caseEntity.id,
    actor,
    type: eventType,
    fromState: caseEntity.state,
    toState,
    timestamp: now,
    payloadHash,
    idempotencyKey,
    metadata: command.metadata,
  };

  // 5. Apply Updates to Case
  const updatedCase: Case = {
    ...caseEntity,
    ...stateUpdates,
    state: toState,
    lastIdempotencyKey: idempotencyKey,
    updatedAt: now,
  };

  return {
    updatedCase,
    event,
    isIdempotentReplay: false,
  };
}
