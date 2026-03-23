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
import { useSession } from '@/hooks/use-session';
import { HugeiconsIcon } from '@hugeicons/react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { useEffect } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

export function SignUpForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: session, isPending: isSessionPending } = useSession();
  const hasSession = session?.session !== null && session?.user !== null;

  useEffect(() => {
    if (!isSessionPending && hasSession) {
      router.replace('/dashboard');
    }
  }, [hasSession, isSessionPending, router]);

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
      await queryClient.invalidateQueries({
        queryKey: SESSION_QUERY_KEY,
        exact: true,
      });

      toast.success('Signed up successfully!');
      router.replace('/dashboard');
      router.refresh();
    },
    onError: error => {
      toast.error(error.message || 'Sign up failed');
    },
  });

  // handle form submit
  function onSubmit(data: SignUpInput) {
    signUpMutation.mutate(data);
  }

  if (isSessionPending || signUpMutation.isPending || hasSession) {
    return (
      <div className="flex items-center justify-center gap-1.5">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-5 w-5 rounded-md bg-stone-300 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-sm rounded-none border border-stone-200 bg-stone-50 p-2">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <span className="absolute -top-px -left-px h-8 w-8 border-t border-l border-black" />
        <span className="absolute -top-px -right-px h-8 w-8 border-t border-r border-black" />
        <span className="absolute -bottom-px -left-px h-8 w-8 border-b border-l border-black" />
        <span className="absolute -right-px -bottom-px h-8 w-8 border-r border-b border-black" />

        <span className="absolute -top-1 -left-1 z-10 size-2 bg-black" />
        <span className="absolute -top-1 -right-1 z-10 size-2 bg-black" />
        <span className="absolute -bottom-1 -left-1 z-10 size-2 bg-black" />
        <span className="absolute -right-1 -bottom-1 z-10 size-2 bg-black" />
      </div>
      <div className="relative overflow-hidden rounded-none border border-dashed border-stone-300 bg-white px-4 pt-4 pb-5">
        <div className="flex flex-col -space-y-6 mb-2.5 font-pixel-square">
          <h1 className="text-2xl tracking-tight">create</h1>
          <h1 className="text-[45px] tracking-tight">account</h1>
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
                  className="h-10 w-full rounded-none border border-stone-200 bg-stone-100 pr-3 pl-9 text-xs text-stone-900 outline-none transition focus:border-stone-300 focus:bg-white"
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
                  className="h-10 w-full rounded-none border border-stone-200 bg-stone-100 pr-3 pl-9 text-xs text-stone-900 outline-none transition focus:border-stone-300 focus:bg-white"
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
                className="h-10 w-full rounded-none border border-stone-200 bg-stone-100 pr-3 pl-9 text-xs text-stone-900 outline-none transition focus:border-stone-300 focus:bg-white"
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
                className="h-10 w-full rounded-none border border-stone-200 bg-stone-100 pr-3 pl-9 text-xs text-stone-900 outline-none transition focus:border-stone-300 focus:bg-white"
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
            className="h-10 w-full rounded-none text-sm font-medium text-white cursor-pointer font-pixel-square bg-stone-900 hover:bg-stone-800 disabled:bg-stone-500 disabled:cursor-not-allowed"
            disabled={signUpMutation.isPending}
          >
            {signUpMutation.isPending ? 'Creating account...' : 'Sign up'}
          </Button>
        </form>
      </div>
      <p className="mt-5 mb-3 text-center text-[0.8125rem] text-stone-500 font-pixel-square">
        Already have an account?{' '}
        <Link
          href="/sign-in"
          className="font-medium text-stone-900 hover:underline underline-offset-4 decoration-2"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
