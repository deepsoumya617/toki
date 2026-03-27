'use client';

import {
  UserGroupIcon,
  LockPasswordIcon,
  HourglassIcon,
} from '@hugeicons/core-free-icons';
import {
  createRoomSchema,
  roomExpiryOptions,
  type CreateRoomInput,
} from '@xd/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import useCreateRoom from '@/hooks/use-create-room';
import { HugeiconsIcon } from '@hugeicons/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Kbd } from './kbd';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateRoomModal({ isOpen, onClose }: CreateRoomModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue, // -> writes new state
    watch, // -> reads current state
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createRoomSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      password: '',
      expiresIn: 'never',
    },
  });

  const createRoomMutation = useCreateRoom();

  const selectedExpiry = watch('expiresIn');

  // handle submit
  function onSubmit(data: CreateRoomInput) {
    createRoomMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Room created successfully');
        reset({
          name: '',
          password: '',
          expiresIn: 'never',
        });
        onClose();
      },
      onError: error => {
        toast.error(error.message || 'Failed to create room');
      },
    });
  }

  if (!isOpen) return null;

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
            <h2 className="text-sm sm:text-base font-medium text-stone-900">
              Create Room
            </h2>
            <Kbd className="font-mono">esc</Kbd>
          </div>
        </div>

        <form
          className="space-y-3 p-3 sm:p-5"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <div className="relative">
              <HugeiconsIcon
                icon={UserGroupIcon}
                strokeWidth={1.8}
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-500"
              />
              <input
                type="text"
                placeholder="Room name"
                {...register('name')}
                className="h-10 w-full rounded-none border border-stone-200 bg-stone-100 pr-3 pl-9 text-xs text-stone-900 outline-none transition focus:border-stone-300 focus:bg-white"
                autoFocus
              />
            </div>
            {errors.name && (
              <p className="mt-1 wrap-break-word text-xs text-red-600">
                {errors.name.message}
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
                placeholder="Room password"
                {...register('password')}
                className="h-10 w-full rounded-none border border-stone-200 bg-stone-100 pr-3 pl-9 text-xs text-stone-900 outline-none transition focus:border-stone-300 focus:bg-white"
              />
            </div>
            {errors.password && (
              <p className="mt-1 wrap-break-word text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <div className="rounded-none border border-stone-200 bg-linear-to-b from-stone-50 to-stone-100 p-2.5">
              <div className="mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-stone-700">
                  <HugeiconsIcon
                    icon={HourglassIcon}
                    strokeWidth={1.8}
                    className="size-4"
                  />
                  <p className="text-xs">Expires in</p>
                </div>
              </div>

              <input type="hidden" {...register('expiresIn')} />

              <div className="grid grid-cols-4 gap-1.5">
                {roomExpiryOptions.map(option => {
                  const isSelected = selectedExpiry === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => {
                        setValue('expiresIn', option, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
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
            {errors.expiresIn && (
              <p className="mt-1 wrap-break-word text-xs text-red-600">
                {errors.expiresIn.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={createRoomMutation.isPending}
            className="cursor-pointer mt-2 w-full border border-stone-900 bg-stone-900 px-4 py-2  text-xs sm:text-sm text-white transition hover:bg-stone-800"
          >
            {createRoomMutation.isPending ? 'Creating Room...' : 'Create Room'}
          </button>
        </form>
      </div>
    </div>
  );
}
