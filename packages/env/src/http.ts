import { createEnv } from '@t3-oss/env-core';

import { nodeEnvSchema } from './shared';
import { z } from 'zod';

export const httpEnv = createEnv({
  server: {
    NODE_ENV: nodeEnvSchema,
    PORT: z.coerce.number().int().positive().default(4000),
    DATABASE_URL: z.url(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',
});
