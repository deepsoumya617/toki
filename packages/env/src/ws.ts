import { createEnv } from '@t3-oss/env-core';

import { nodeEnvSchema } from './shared';
import { z } from 'zod';

export const wsEnv = createEnv({
  server: {
    NODE_ENV: nodeEnvSchema,
    WS_PORT: z.coerce.number().int().positive().default(4001),
    WS_ORIGIN: z.url().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    WS_PORT: process.env.WS_PORT,
    WS_ORIGIN: process.env.WS_ORIGIN,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',
});
