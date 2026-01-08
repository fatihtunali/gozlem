import { Router, Request, Response, NextFunction } from 'express';
import { getSession } from '../services/sessionService.js';
import { getTimeline } from '../services/choiceService.js';
import { generateRevelation } from '../services/revelationService.js';
import { SessionIdParamSchema, TimelineQuerySchema } from '../schemas/index.js';
import type { ApiError, Timeline, TimelineEvent } from '../types/index.js';

const router = Router();

// GET /v1/sessions/:sessionId/timeline - Get event timeline
router.get('/:sessionId/timeline', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paramResult = SessionIdParamSchema.safeParse(req.params);

    if (!paramResult.success) {
      const error: ApiError = {
        code: 'BAD_REQUEST',
        message: 'Invalid session ID.',
      };
      return res.status(400).json(error);
    }

    const queryResult = TimelineQuerySchema.safeParse(req.query);
    const limit = queryResult.success ? queryResult.data.limit : 50;

    const { sessionId } = paramResult.data;

    const session = await getSession(sessionId);

    if (!session) {
      const error: ApiError = {
        code: 'NOT_FOUND',
        message: 'Session not found.',
      };
      return res.status(404).json(error);
    }

    const eventRows = await getTimeline(sessionId, limit);

    const events: TimelineEvent[] = eventRows.map(row => ({
      id: row.id,
      ts: row.ts.toISOString(),
      promptId: row.prompt_id,
      choiceId: row.choice_id,
      feedbackText: row.feedback_text,
    }));

    const timeline: Timeline = {
      sessionId,
      events,
    };

    return res.json(timeline);
  } catch (err) {
    next(err);
  }
});

// GET /v1/sessions/:sessionId/revelation - Get revelation report
router.get('/:sessionId/revelation', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paramResult = SessionIdParamSchema.safeParse(req.params);

    if (!paramResult.success) {
      const error: ApiError = {
        code: 'BAD_REQUEST',
        message: 'Invalid session ID.',
      };
      return res.status(400).json(error);
    }

    const { sessionId } = paramResult.data;

    const session = await getSession(sessionId);

    if (!session) {
      const error: ApiError = {
        code: 'NOT_FOUND',
        message: 'Session not found.',
      };
      return res.status(404).json(error);
    }

    const step = session.state.step;

    if (step < 7) {
      const error: ApiError = {
        code: 'REVELATION_NOT_READY',
        message: 'Henüz yeterli seçim yapılmadı.',
        details: {
          currentStep: step,
          nextMilestone: 7,
        },
      };
      return res.status(404).json(error);
    }

    const revelation = await generateRevelation(sessionId, step);

    if (!revelation) {
      const error: ApiError = {
        code: 'NOT_FOUND',
        message: 'Could not generate revelation.',
      };
      return res.status(404).json(error);
    }

    return res.json(revelation);
  } catch (err) {
    next(err);
  }
});

export default router;
