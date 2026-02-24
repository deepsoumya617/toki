import { createEnv } from '@t3-oss/env-core';

import { nodeEnvSchema } from './shared';
import { z } from 'zod';

export const httpEnv = createEnv({
  server: {
    NODE_ENV: nodeEnvSchema,
    PORT: z.coerce.number().int().positive(),
    REDIS_URL: z.url(),
    WEB_ORIGIN: z.url().default('http://localhost:3000'),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    REDIS_URL: process.env.REDIS_URL,
    WEB_ORIGIN: process.env.WEB_ORIGIN,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',
});
