'use client';

import { useRouter } from 'next/navigation';
import { CornerUpLeft } from 'lucide-react';

interface BackButtonProps {
  href?: string;
  label?: string;
}

export default function BackButton({ href, label = 'Back' }: BackButtonProps) {
  const router = useRouter();

  return (
    <div
      className="inline-flex items-center gap-1.5 text-stone-400 group hover:text-stone-950 cursor-pointer transition-colors duration-300"
      onClick={() => (href ? router.push(href) : router.back())}
    >
      <CornerUpLeft
        size={18}
        strokeWidth={2}
        className="group-hover:-translate-x-1 transition-transform duration-300"
      />
      <span className="text-[15px] uppercase tracking-wider pt-1 font-medium">
        {label}
      </span>
    </div>
  );
}
