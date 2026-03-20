'use client';

import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';

interface DmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (username: string) => void;
}

export function DmModal({ isOpen, onClose, onSubmit }: DmModalProps) {
  const [username, setUsername] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSubmit(username.trim());
      setUsername('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full border border-stone-200 bg-white sm:w-auto sm:max-w-sm">
        <span className="absolute -top-1 -left-1 size-2 border border-stone-300 bg-white hidden sm:block" />
        <span className="absolute -top-1 -right-1 size-2 border border-stone-300 bg-white hidden sm:block" />
        <span className="absolute -bottom-1 -left-1 size-2 border border-stone-300 bg-white hidden sm:block" />
        <span className="absolute -bottom-1 -right-1 size-2 border border-stone-300 bg-white hidden sm:block" />

        <div className="border-b border-stone-200 px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex items-center justify-between">
            <h2 className="font-pixel-square text-sm sm:text-base">New DM</h2>
            <button
              onClick={onClose}
              className="text-stone-500 hover:text-stone-900 cursor-pointer"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-3 sm:p-4">
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Enter username"
            className="w-full border border-stone-200 bg-stone-50 px-3 py-2 text-sm outline-none focus:border-stone-400 focus:bg-white"
            autoFocus
          />
          <button
            type="submit"
            className="mt-2 w-full border border-stone-900 bg-stone-900 px-4 py-2 font-pixel-square text-xs sm:text-sm text-white transition hover:bg-stone-800"
          >
            Start Chat
          </button>
        </form>
      </div>
    </div>
  );
}
