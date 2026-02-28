'use client';

import { LockPasswordIcon, Mail01Icon } from '@hugeicons/core-free-icons';
import { signInSchema, type SignInInput } from '@xd/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import Link from 'next/link';

export function SignInForm() {
  const router = useRouter();

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
    onSuccess: () => {
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
    <div className="mx-auto w-full max-w-sm rounded-3xl border border-stone-200 bg-stone-50 p-2">
      <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white px-4 pt-4 pb-5">
        <div className="mb-2.5 flex flex-col -space-y-5">
          <h1 className="bg-linear-to-r from-stone-600 to-stone-900 bg-clip-text text-3xl font-cooper font-medium tracking-tight text-transparent italic">
            welcome
          </h1>
          <h1 className="bg-linear-to-r from-stone-600 to-stone-900 bg-clip-text text-[45px] font-cooper font-medium tracking-tight text-transparent">
            back 
          </h1>
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
                disabled={signInMutation.isPending}
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
            className="h-10 w-full cursor-pointer rounded-lg bg-[#84934A] text-sm font-medium text-white hover:bg-[#7a8a42]"
            disabled={signInMutation.isPending}
          >
            {signInMutation.isPending ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>

      <p className="mt-5 mb-3 text-center text-sm text-stone-500">
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
