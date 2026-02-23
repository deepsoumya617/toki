import z from 'zod';

const emailField = z
  .email('Invalid email address')
  .trim()
  .min(1, 'Email is required')
  .max(255, 'Email is too long')
  .toLowerCase();

const passwordField = z
  .string()
  .trim()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must be less than 128 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[^A-Za-z0-9]/,
    'Password must contain at least one special character'
  );

export const signUpSchema = z.object({
  email: emailField,
  password: passwordField,
  username: z
    .string()
    .trim()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters long')
    .max(50, 'Username is too long')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    ),
  displayName: z
    .string()
    .trim()
    .min(1, 'Display name is required')
    .min(3, 'Display name must be at least 3 characters long')
    .max(100, 'Display name is too long'),
});

export const logInSchema = z.object({
  email: emailField,
  password: z
    .string()
    .trim()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must be less than 128 characters long'),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LogInInput = z.infer<typeof logInSchema>;
