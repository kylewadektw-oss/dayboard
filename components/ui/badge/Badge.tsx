/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 *
 * Copyright (c) 2025 BentLo Labs LLC (developer@bentlolabs.com)
 *
 * This file is part of Dayboard, a proprietary household command center application.
 *
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 *
 * For licensing inquiries: developer@bentlolabs.com
 *
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

import React from 'react';
import { cn } from '@/utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'slim';
  children: React.ReactNode;
}

const badgeVariants = {
  default: 'bg-blue-900 text-blue-100 border-blue-700',
  secondary: 'bg-zinc-700 text-zinc-100 border-zinc-600',
  outline: 'border border-zinc-600 text-zinc-300 bg-transparent',
  destructive: 'bg-red-900 text-red-100 border-red-700',
  slim: 'bg-zinc-800 text-zinc-200 border-zinc-600 px-2 py-0.5 text-xs'
};

function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border',
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
export { Badge };
