'use client';

import { signUpSchema, type SignUpInput } from '@xd/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Field } from './field';
import { toast } from 'sonner';
import Link from 'next/link';

export function SignUpForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, dirtyFields },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      username: '',
      displayName: '',
      password: '',
    },
  });

  function isFieldValid(field: keyof SignUpInput) {
    return touchedFields[field] && dirtyFields[field] && !errors[field];
  }

  // sign up mutation
  const signUpMutation = useMutation({
    mutationFn: authClient.signUp,
    onSuccess: () => {
      toast.success('Signed up successfully!');
      router.push('/dashboard');
    },
    onError: error => {
      toast.error(error.message || 'Sign up failed');
    },
  });

  // handle form submit
  function onSubmit(data: SignUpInput) {
    signUpMutation.mutate(data);
  }

  return (
    <div className="flex items-center justify-center w-full">
      <div className="w-full max-w-sm border border-stone-199 rounded-2xl">
        <div className="border-b p-4 bg-neutral-50 rounded-t-2xl">
          <h1 className="text-2xl font-medium tracking-tight bg-linear-to-r from-stone-600 to-stone-900 bg-clip-text text-transparent">
            Create account
          </h1>
          <p className="mt-0.5 text-xs text-stone-500 font-inter">
            Enter your information to get{' '}
            <span className="font-medium italic text-stone-700">
              started
            </span>
            .
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 px-6 py-5 sm:px-6 sm:py-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Display Name"
              name="displayName"
              register={register}
              error={errors.displayName}
              disabled={signUpMutation.isPending}
              isValid={isFieldValid('displayName')}
            />
            <Field
              label="Username"
              name="username"
              register={register}
              error={errors.username}
              disabled={signUpMutation.isPending}
              isValid={isFieldValid('username')}
            />
          </div>
          <Field
            label="Email"
            name="email"
            type="email"
            register={register}
            error={errors.email}
            disabled={signUpMutation.isPending}
            isValid={isFieldValid('email')}
          />
          <Field
            label="Password"
            name="password"
            type="password"
            register={register}
            error={errors.password}
            disabled={signUpMutation.isPending}
            isValid={isFieldValid('password')}
          />

          <Button
            type="submit"
            className="w-full h-11 rounded-lg bg-linear-to-r from-stone-800 to-stone-900 text-white font-medium text-sm hover:from-stone-900 hover:to-stone-950 transition-all duration-200 disabled:opacity-50 cursor-pointer uppercase font-mono tracking-wide"
            disabled={signUpMutation.isPending}
          >
            {signUpMutation.isPending ? 'Creating account...' : 'Sign up'}
          </Button>

          <p className="text-center text-sm text-stone-600 font-inter">
            Already have an account?{' '}
            <Link
              href="/sign-in"
              className="text-stone-900 font-medium hover:underline"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
