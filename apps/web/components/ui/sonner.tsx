'use client';

import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      closeButton
      icons={{
        success: null,
        info: null,
        warning: null,
        error: null,
        loading: null,
      }}
      toastOptions={{
        classNames: {
          toast: '!shadow-none',
          success: '!shadow-none',
          info: '!shadow-none',
          warning: '!shadow-none',
          error: '!shadow-none',
          loading: '!shadow-none',
        },
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius)',
          '--toast-shadow': 'none',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
