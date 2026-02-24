import { createEnv } from '@t3-oss/env-core';

import { nodeEnvSchema } from './shared';
import { z } from 'zod';

export const webEnv = createEnv({
  server: {
    NODE_ENV: nodeEnvSchema,
  },
  clientPrefix: 'NEXT_PUBLIC_',
  client: {
    NEXT_PUBLIC_API_URL: z.string().min(1),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',
});
