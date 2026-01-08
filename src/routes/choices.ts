import { Router, Request, Response, NextFunction } from 'express';
import { getSession } from '../services/sessionService.js';
import { processChoice, checkIdempotency } from '../services/choiceService.js';
import { SubmitChoiceRequestSchema } from '../schemas/index.js';
import type { ApiError } from '../types/index.js';

const router = Router();

// POST /v1/choices - Submit choice and get feedback
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = SubmitChoiceRequestSchema.safeParse(req.body);

    if (!parseResult.success) {
      const error: ApiError = {
        code: 'BAD_REQUEST',
        message: 'Invalid payload.',
        details: parseResult.error.flatten(),
      };
      return res.status(400).json(error);
    }

    const request = parseResult.data;
    const idempotencyKey = req.headers['idempotency-key'] as string | undefined;

    // Check idempotency
    if (idempotencyKey) {
      const idempotencyResult = await checkIdempotency(idempotencyKey, request);

      if (idempotencyResult.exists) {
        if (idempotencyResult.conflict) {
          const error: ApiError = {
            code: 'IDEMPOTENCY_CONFLICT',
            message: 'Same idempotency key used with different request payload.',
          };
          return res.status(409).json(error);
        }

        // Return cached response
        return res.json(idempotencyResult.response);
      }
    }

    // Get session
    const session = await getSession(request.sessionId);

    if (!session) {
      const error: ApiError = {
        code: 'NOT_FOUND',
        message: 'Session not found.',
      };
      return res.status(404).json(error);
    }

    // Process choice
    const result = await processChoice(request, session.state, idempotencyKey);

    return res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
