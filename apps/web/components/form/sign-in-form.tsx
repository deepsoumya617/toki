'use client';

import { LockPasswordIcon, Mail01Icon } from '@hugeicons/core-free-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signInSchema, type SignInInput } from '@xd/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { HugeiconsIcon } from '@hugeicons/react';
import { authClient } from '@/lib/auth-client';
import { SESSION_QUERY_KEY } from '@xd/shared';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import Link from 'next/link';

export function SignInForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signInMutation = useMutation({
    mutationFn: authClient.signIn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
      const freshSession = await authClient.getSession();
      queryClient.setQueryData(SESSION_QUERY_KEY, freshSession);
      toast.success('Signed in successfully!');
      router.push('/dashboard');
    },
    onError: error => {
      toast.error(error.message || 'Sign in failed');
    },
  });

  function onSubmit(data: SignInInput) {
    signInMutation.mutate(data);
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
        <div className="flex flex-col -space-y-4 mb-2.5 font-pixel-square">
          <h1 className="text-xl tracking-tight">welcome</h1>
          <h1 className="text-[45px] tracking">back!</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
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
                disabled={signInMutation.isPending}
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
                disabled={signInMutation.isPending}
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
            className="h-10 w-full cursor-pointer rounded-none font-pixel-square bg-stone-900 hover:bg-stone-800 disabled:bg-stone-500 disabled:cursor-not-allowed"
            disabled={signInMutation.isPending}
          >
            {signInMutation.isPending ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>

      <p className="mt-5 mb-3 text-center text-[0.8125rem] text-stone-500 font-pixel-square">
        Don&apos;t have an account?{' '}
        <Link
          href="/sign-up"
          className="font-medium text-stone-900 underline-offset-4 decoration-2 decoration-[#84934A] hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
