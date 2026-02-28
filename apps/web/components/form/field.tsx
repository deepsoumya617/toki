import type { FieldError, UseFormRegister } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  description?: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  disabled?: boolean;
  isValid?: boolean;
};

export function Field({
  label,
  name,
  type = 'text',
  placeholder,
  description,
  register,
  error,
  disabled,
  isValid = false,
}: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-xs">
        {label}
        <span className="text-destructive -ml-1">*</span>
      </Label>

      <div className="relative">
        <Input
          id={name}
          type={type}
          placeholder={placeholder}
          {...register(name)}
          disabled={disabled}
          className={cn(
            'transition-colors rounded-lg shadow-none',
            error && 'border-destructive focus-visible:ring-destructive pr-10',
            isValid &&
              !error &&
              'border-green-500 focus-visible:ring-green-500 pr-10'
          )}
        />
      </div>

      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {error && (
        <p className="text-sm text-destructive animate-in slide-in-from-top-1 duration-200">
          {error.message}
        </p>
      )}
    </div>
  );
}
