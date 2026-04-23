'use client';

import { joinRoomSchema, type JoinRoomInput } from '@xd/shared';
import { LockPasswordIcon } from '@hugeicons/core-free-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { HugeiconsIcon } from '@hugeicons/react';
import { ApiErrorClient } from '@/lib/api-error';
import useJoinRoom from '@/hooks/use-join-room';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Label } from './label';
import { toast } from 'sonner';
import { Kbd } from './kbd';

interface JoinRoomModalProps {
  roomId?: string;
}

export default function JoinRoomModal({ roomId }: JoinRoomModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<JoinRoomInput>({
    resolver: zodResolver(joinRoomSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      password: '',
    },
  });

  const router = useRouter();

  const joinRoomMutation = useJoinRoom();

  // conflict / success -> same
  function handleSuccess() {
    reset({ password: '' });
    router.replace(`/dashboard/rooms/${roomId}`);
  }

  function onSubmit(data: JoinRoomInput) {
    if (!roomId) return;

    joinRoomMutation.mutate(
      { roomId, input: data },
      {
        onSuccess: () => {
          toast.success('Joined room successfully');
          handleSuccess();
        },
        onError: error => {
          if (!(error instanceof ApiErrorClient)) {
            setError('password', { message: 'Something went wrong' });
            return;
          }

          switch (error.code) {
            case 'CONFLICT':
              handleSuccess();
              break;
            case 'UNAUTHORIZED':
              setError('password', { message: error.message });
              break;
            case 'NOT_FOUND':
            case 'GONE':
            default:
              setError('root', { message: error.message });
              break;
          }
        },
      }
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />

      <div className="relative z-10 w-full border border-stone-200 bg-white sm:w-88">
        <span className="absolute -top-1 -left-1 size-2 border border-stone-300 bg-white hidden sm:block" />
        <span className="absolute -top-1 -right-1 size-2 border border-stone-300 bg-white hidden sm:block" />
        <span className="absolute -bottom-1 -left-1 size-2 border border-stone-300 bg-white hidden sm:block" />
        <span className="absolute -bottom-1 -right-1 size-2 border border-stone-300 bg-white hidden sm:block" />

        <div className="border-b border-stone-200 px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-semibold tracking-tight text-stone-900">
              Join Room
            </h2>
            <Kbd className="font-mono">esc</Kbd>
          </div>
        </div>

        <form
          className="space-y-3 p-3 sm:p-5"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <div className="mb-1 flex items-center gap-0.5">
              <Label
                htmlFor="room-password"
                className="text-xs font-medium text-stone-700"
              >
                Password
              </Label>
              <span
                aria-hidden="true"
                className="text-xs leading-none text-red-600"
                title="Required"
              >
                *
              </span>
            </div>
            <div className="relative">
              <HugeiconsIcon
                icon={LockPasswordIcon}
                strokeWidth={1.8}
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-500"
              />
              <input
                id="room-password"
                type="password"
                placeholder="e.g. 234466"
                {...register('password')}
                className="h-10 w-full rounded-none border border-stone-200 bg-stone-100 pr-3 pl-9 text-xs text-stone-900 outline-none transition focus:border-stone-300 focus:bg-white"
                autoFocus
              />
            </div>
            {errors.password && (
              <p className="mt-1 wrap-break-word text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>
          {/* show root error message */}
          {errors.root && (
            <p className="mt-1 wrap-break-word text-xs text-red-600">
              {errors.root.message}
            </p>
          )}
          <button
            type="submit"
            disabled={joinRoomMutation.isPending}
            className="cursor-pointer mt-2 w-full border border-stone-900 bg-stone-900 px-4 py-2 text-xs sm:text-sm text-white transition hover:bg-stone-800"
          >
            {joinRoomMutation.isPending ? 'Joining Room...' : 'Join Room'}
          </button>
        </form>
      </div>
    </div>
  );
}
