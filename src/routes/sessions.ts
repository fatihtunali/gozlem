import { Router, Request, Response, NextFunction } from 'express';
import { createSession, getSession } from '../services/sessionService.js';
import { CreateSessionRequestSchema, SessionIdParamSchema } from '../schemas/index.js';
import type { ApiError } from '../types/index.js';

const router = Router();

// POST /v1/sessions - Create new session
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = CreateSessionRequestSchema.safeParse(req.body || {});

    if (!parseResult.success) {
      const error: ApiError = {
        code: 'BAD_REQUEST',
        message: 'Invalid payload.',
        details: parseResult.error.flatten(),
      };
      return res.status(400).json(error);
    }

    const session = await createSession(parseResult.data);
    return res.status(201).json(session);
  } catch (err) {
    next(err);
  }
});

// GET /v1/sessions/:sessionId - Get session details
router.get('/:sessionId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = SessionIdParamSchema.safeParse(req.params);

    if (!parseResult.success) {
      const error: ApiError = {
        code: 'BAD_REQUEST',
        message: 'Invalid session ID.',
      };
      return res.status(400).json(error);
    }

    const session = await getSession(parseResult.data.sessionId);

    if (!session) {
      const error: ApiError = {
        code: 'NOT_FOUND',
        message: 'Session not found.',
      };
      return res.status(404).json(error);
    }

    return res.json(session);
  } catch (err) {
    next(err);
  }
});

export default router;
