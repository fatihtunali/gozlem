import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { config } from './config.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Routes
import sessionsRouter from './routes/sessions.js';
import promptsRouter from './routes/prompts.js';
import choicesRouter from './routes/choices.js';
import analyticsRouter from './routes/analytics.js';
import healthRouter from './routes/health.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Load OpenAPI spec
const openapiPath = join(__dirname, '..', 'openapi.yaml');
const openapiDocument = YAML.load(openapiPath);

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Gozlem API Docs',
}));

// API Routes
app.use('/v1/sessions', sessionsRouter);
app.use('/v1/prompts', promptsRouter);
app.use('/v1/choices', choicesRouter);
app.use('/v1/sessions', analyticsRouter); // timeline and revelation are under /sessions/:id/*
app.use('/v1/health', healthRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🎮 Gozlem Game API                              ║
║                                                   ║
║   Server running on: http://localhost:${config.port}       ║
║   API Docs:          http://localhost:${config.port}/docs  ║
║   Environment:       ${config.nodeEnv.padEnd(23)}║
║                                                   ║
╚═══════════════════════════════════════════════════╝
  `);
});

export default app;
