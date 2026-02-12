import { z } from 'zod';

export const nodeEnvSchema = z
  .enum(['development', 'test', 'production'])
  .default('development');
