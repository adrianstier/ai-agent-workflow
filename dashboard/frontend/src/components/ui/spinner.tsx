import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const spinnerVariants = cva('animate-spin rounded-full border-2 border-current border-t-transparent', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
    variant: {
      default: 'text-slate-600',
      primary: 'text-blue-600',
      white: 'text-white',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
});

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof spinnerVariants> {
  label?: string;
}

export function Spinner({ className, size, variant, label, ...props }: SpinnerProps) {
  return (
    <div className="inline-flex items-center gap-2" {...props}>
      <div
        className={cn(spinnerVariants({ size, variant }), className)}
        role="status"
        aria-label={label || 'Loading'}
      >
        <span className="sr-only">{label || 'Loading'}</span>
      </div>
      {label && <span className="text-sm text-slate-600">{label}</span>}
    </div>
  );
}

export interface LoadingOverlayProps {
  loading: boolean;
  children: React.ReactNode;
  label?: string;
}

export function LoadingOverlay({ loading, children, label }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <Spinner size="lg" variant="primary" label={label} />
        </div>
      )}
    </div>
  );
}
