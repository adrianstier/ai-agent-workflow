import * as React from 'react';
import { cn } from '@/lib/cn';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-12 text-center', className)}>
      {icon && <div className="mb-4 text-slate-400">{icon}</div>}

      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>

      <p className="text-slate-600 mb-6 max-w-sm">{description}</p>

      {action && <div>{action}</div>}
    </div>
  );
}
