'use client';

import {
  roomExpiryOptions,
  updateRoomSchema,
  type UpdateRoomInput,
  type RoomExpiryOption,
} from '@xd/shared';
import { LockPasswordIcon, UserGroupIcon } from '@hugeicons/core-free-icons';
import useUpdateRoom from '@/hooks/use-update-room';
import { HugeiconsIcon } from '@hugeicons/react';
import { useForm } from 'react-hook-form';
import { Label } from './label';
import { toast } from 'sonner';
import { Kbd } from './kbd';

interface UpdateRoomModalProps {
  roomId?: string;
  isOpen: boolean;
  onClose: () => void;
}

type FormValues = {
  name: string;
  password: string;
  expiresIn: RoomExpiryOption | undefined;
};

export default function UpdateRoomModal({
  roomId,
  isOpen,
  onClose,
}: UpdateRoomModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: '', password: '', expiresIn: undefined },
  });

  const updateRoomMutation = useUpdateRoom();
  const selectedExpiry = watch('expiresIn');

  const onSubmit = (data: FormValues) => {
    if (!roomId) return;

    // works for now
    const parsed = updateRoomSchema.safeParse({
      name: data.name.trim() || undefined,
      password: data.password.trim() || undefined,
      expiresIn: data.expiresIn,
    });

    if (!parsed.success) {
      parsed.error.issues.forEach(issue => {
        const field = issue.path[0] as keyof FormValues | undefined;
        if (field) setError(field, { message: issue.message });
        else setError('root', { message: issue.message });
      });
      return;
    }

    const input: UpdateRoomInput = parsed.data;

    updateRoomMutation.mutate(
      { roomId, input },
      {
        onSuccess: () => {
          toast.success('Room Updated');
          reset({ name: '', password: '', expiresIn: undefined });
          onClose();
        },
        onError: error => {
          toast.error(error.message || 'Failed to update room');
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 h-screen"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full border border-stone-200 bg-white sm:w-88">
        <span className="absolute -top-1 -left-1 size-2 border border-stone-300 bg-white hidden sm:block" />
        <span className="absolute -top-1 -right-1 size-2 border border-stone-300 bg-white hidden sm:block" />
        <span className="absolute -bottom-1 -left-1 size-2 border border-stone-300 bg-white hidden sm:block" />
        <span className="absolute -bottom-1 -right-1 size-2 border border-stone-300 bg-white hidden sm:block" />

        <div className="border-b border-stone-200 px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-semibold tracking-tight text-stone-900">
              Update Room
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
                htmlFor="room-name"
                className="text-xs font-medium text-stone-700"
              >
                Name
              </Label>
            </div>
            <div className="relative">
              <HugeiconsIcon
                icon={UserGroupIcon}
                strokeWidth={1.8}
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-500"
              />
              <input
                id="room-name"
                type="text"
                placeholder="e.g. lockin"
                {...register('name')}
                className="h-10 w-full rounded-none border border-stone-200 bg-stone-100 pr-3 pl-9 text-xs text-stone-900 outline-none transition focus:border-stone-300 focus:bg-white"
                autoFocus
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <div className="mb-1 flex items-center gap-0.5">
              <Label
                htmlFor="room-password"
                className="text-xs font-medium text-stone-700"
              >
                Password
              </Label>
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
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <Label className="mb-1 block text-xs font-medium text-stone-700">
              Expires in
            </Label>
            <div className="rounded-none border border-stone-200 bg-linear-to-b from-stone-50 to-stone-100 p-2.5">
              <div className="grid grid-cols-4 gap-1.5">
                {roomExpiryOptions.map(option => {
                  const isSelected = selectedExpiry === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() =>
                        setValue('expiresIn', isSelected ? undefined : option)
                      }
                      className={`py-3 border border-dashed px-1 text-xs leading-none transition cursor-pointer font-medium ${
                        isSelected
                          ? 'border-stone-950 bg-stone-300/50 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)]'
                          : 'border-stone-300 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50'
                      }`}
                    >
                      {option === 'never' ? 'N' : option}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {errors.root && (
            <p className="text-xs text-red-600">{errors.root.message}</p>
          )}

          <button
            type="submit"
            disabled={updateRoomMutation.isPending}
            className="cursor-pointer mt-2 w-full border border-stone-900 bg-stone-900 px-4 py-2 text-xs sm:text-sm text-white transition hover:bg-stone-800"
          >
            {updateRoomMutation.isPending ? 'Updating Room...' : 'Update Room'}
          </button>
        </form>
      </div>
    </div>
  );
}
