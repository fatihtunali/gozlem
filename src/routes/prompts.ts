import { Router, Request, Response, NextFunction } from 'express';
import { getSession } from '../services/sessionService.js';
import { getNextPrompt } from '../services/promptService.js';
import { GetNextPromptQuerySchema } from '../schemas/index.js';
import type { ApiError } from '../types/index.js';

const router = Router();

// GET /v1/prompts/next - Get next prompt for session
router.get('/next', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = GetNextPromptQuerySchema.safeParse(req.query);

    if (!parseResult.success) {
      const error: ApiError = {
        code: 'BAD_REQUEST',
        message: 'Invalid query parameters.',
        details: parseResult.error.flatten(),
      };
      return res.status(400).json(error);
    }

    const { sessionId } = parseResult.data;

    const session = await getSession(sessionId);

    if (!session) {
      const error: ApiError = {
        code: 'NOT_FOUND',
        message: 'Session not found.',
      };
      return res.status(404).json(error);
    }

    const prompt = getNextPrompt(sessionId, session.state);

    return res.json(prompt);
  } catch (err) {
    next(err);
  }
});

export default router;
