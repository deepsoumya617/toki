'use client';

import {
  LockPasswordIcon,
  Mail01Icon,
  AiUserIcon,
  UserSearch01Icon,
} from '@hugeicons/core-free-icons';
import { SESSION_QUERY_KEY, signUpSchema, type SignUpInput } from '@xd/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { HugeiconsIcon } from '@hugeicons/react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import Link from 'next/link';

export function SignUpForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
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

  // sign up mutation
  const signUpMutation = useMutation({
    mutationFn: authClient.signUp,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
      const freshSession = await authClient.getSession();
      queryClient.setQueryData(SESSION_QUERY_KEY, freshSession);
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
    <div className="mx-auto w-full max-w-sm rounded-3xl border border-stone-200 bg-stone-50 p-2">
      <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white px-4 pt-4 pb-5">
        <div className="flex flex-col -space-y-5 mb-2.5">
          <h1 className="text-3xl font-cooper font-medium tracking-tight bg-linear-to-r from-stone-600 to-stone-900 bg-clip-text text-transparent italic">
            create
          </h1>
          <div className="text-[45px] font-cooper font-medium tracking-tight bg-linear-to-r from-stone-600 to-stone-900 bg-clip-text text-transparent">
            account
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="relative">
                <HugeiconsIcon
                  icon={AiUserIcon}
                  strokeWidth={1.8}
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-500"
                />
                <input
                  type="text"
                  placeholder="Display Name"
                  disabled={signUpMutation.isPending}
                  {...register('displayName')}
                  className="h-10 w-full rounded-lg border border-stone-200 bg-stone-100 pr-3 pl-9 text-xs text-stone-900 outline-none transition focus:border-stone-300 focus:bg-white"
                />
              </div>
              {errors.displayName && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.displayName.message}
                </p>
              )}
            </div>
            <div>
              <div className="relative">
                <HugeiconsIcon
                  icon={UserSearch01Icon}
                  strokeWidth={1.8}
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-500"
                />
                <input
                  type="text"
                  placeholder="Username"
                  disabled={signUpMutation.isPending}
                  {...register('username')}
                  className="h-10 w-full rounded-lg border border-stone-200 bg-stone-100 pr-3 pl-9 text-xs text-stone-900 outline-none transition focus:border-stone-300 focus:bg-white"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.username.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="relative">
              <HugeiconsIcon
                icon={Mail01Icon}
                strokeWidth={1.8}
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-500"
              />
              <input
                type="email"
                placeholder="Email"
                disabled={signUpMutation.isPending}
                {...register('email')}
                className="h-10 w-full rounded-lg border border-stone-200 bg-stone-100 pr-3 pl-9 text-xs text-stone-900 outline-none transition focus:border-stone-300 focus:bg-white"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <div className="relative">
              <HugeiconsIcon
                icon={LockPasswordIcon}
                strokeWidth={1.8}
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-500"
              />
              <input
                type="password"
                placeholder="Password"
                disabled={signUpMutation.isPending}
                {...register('password')}
                className="h-10 w-full rounded-lg border border-stone-200 bg-stone-100 pr-3 pl-9 text-xs text-stone-900 outline-none transition focus:border-stone-300 focus:bg-white"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="h-10 w-full rounded-lg bg-[#84934A] text-sm font-medium text-white hover:bg-[#7a8a42] cursor-pointer"
            disabled={signUpMutation.isPending}
          >
            {signUpMutation.isPending ? 'Creating account...' : 'Sign up'}
          </Button>
        </form>
      </div>
      <p className="mt-5 mb-3 text-center text-sm text-stone-500">
        Already have an account?{' '}
        <Link
          href="/sign-in"
          className="font-medium text-stone-900 hover:underline underline-offset-4 decoration-2 decoration-[#84934A]"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
