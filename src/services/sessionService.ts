import { v4 as uuidv4 } from 'uuid';
import { query, queryOne } from '../db/client.js';
import type { Session, SessionState, CreateSessionRequest, SessionRow } from '../types/index.js';

const DEFAULT_STATE: SessionState = {
  step: 0,
  lastChoiceId: null,
  streak: { sameChoice: 0 },
};

export async function createSession(request: CreateSessionRequest): Promise<Session> {
  const id = uuidv4();
  const locale = request.locale || 'tr';
  const state = DEFAULT_STATE;

  await query(
    `INSERT INTO sessions (id, locale, client_fingerprint, state, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, locale, request.clientFingerprint || null, JSON.stringify(state), request.metadata ? JSON.stringify(request.metadata) : null]
  );

  const row = await queryOne<SessionRow>(
    'SELECT * FROM sessions WHERE id = $1',
    [id]
  );

  if (!row) {
    throw new Error('Failed to create session');
  }

  return mapRowToSession(row);
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const row = await queryOne<SessionRow>(
    'SELECT * FROM sessions WHERE id = $1',
    [sessionId]
  );

  if (!row) {
    return null;
  }

  return mapRowToSession(row);
}

export async function updateSessionState(sessionId: string, state: SessionState): Promise<void> {
  await query(
    'UPDATE sessions SET state = $1 WHERE id = $2',
    [JSON.stringify(state), sessionId]
  );
}

function mapRowToSession(row: SessionRow): Session {
  return {
    id: row.id,
    createdAt: row.created_at.toISOString(),
    locale: row.locale,
    state: typeof row.state === 'string' ? JSON.parse(row.state) : row.state,
  };
}
