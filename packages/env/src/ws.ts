import { createEnv } from '@t3-oss/env-core';

import { nodeEnvSchema } from './shared';
import { z } from 'zod';

export const wsEnv = createEnv({
  server: {
    NODE_ENV: nodeEnvSchema,
    REDIS_URL: z.string(),
    WS_PORT: z.coerce.number().int().positive().default(8081),
    WS_ORIGIN: z.url().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    REDIS_URL: process.env.REDIS_URL,
    WS_PORT: process.env.WS_PORT,
    WS_ORIGIN: process.env.WS_ORIGIN,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',
});
