/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kyle.wade.ktw@gmail.com)
 * 
 * This file is part of Dayboard, a proprietary household command center application.
 * 
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 * 
 * For licensing inquiries: kyle.wade.ktw@gmail.com
 * 
 * Violation of this notice may result in legal action and damages up to $100,000.
 */


'use client';

import cn from 'classnames';
import React, { forwardRef, useRef, ButtonHTMLAttributes } from 'react';
import { mergeRefs } from 'react-merge-refs';

import LoadingDots from '@/components/ui/LoadingDots';

import styles from './Button.module.css';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'slim' | 'flat' | 'outline' | 'ghost' | 'primary' | 'secondary' | 'destructive';
  active?: boolean;
  width?: number;
  loading?: boolean;
  Component?: React.ComponentType;
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, Props>((props, buttonRef) => {
  const {
    className,
    variant = 'flat',
    children,
    active,
    width,
    loading = false,
    disabled = false,
    style = {},
    Component = 'button',
    size = 'md',
    ...rest
  } = props;
  const ref = useRef(null);
  
  // Handle new variants with Tailwind classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'outline':
        return 'border border-zinc-600 bg-transparent hover:bg-zinc-800 text-zinc-300';
      case 'ghost':
        return 'bg-transparent hover:bg-zinc-800 text-zinc-300';
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'secondary':
        return 'bg-zinc-700 hover:bg-zinc-600 text-white';
      case 'destructive':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'slim':
      case 'flat':
      default:
        return '';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      case 'md':
      default:
        return 'px-4 py-2';
    }
  };

  const rootClassName = cn(
    styles.root,
    {
      [styles.slim]: variant === 'slim',
      [styles.loading]: loading,
      [styles.disabled]: disabled
    },
    // Add new variant styles
    variant === 'outline' || variant === 'ghost' || variant === 'primary' || variant === 'secondary' || variant === 'destructive' 
      ? `rounded-md transition-colors ${getVariantClasses()} ${getSizeClasses()}` 
      : '',
    className
  );
  return (
    <Component
      aria-pressed={active}
      data-variant={variant}
      ref={mergeRefs([ref, buttonRef])}
      className={rootClassName}
      disabled={disabled}
      style={{
        width,
        ...style
      }}
      {...rest}
    >
      {children}
      {loading && (
        <i className="flex pl-2 m-0">
          <LoadingDots />
        </i>
      )}
    </Component>
  );
});
Button.displayName = 'Button';

export default Button;
export { Button };
