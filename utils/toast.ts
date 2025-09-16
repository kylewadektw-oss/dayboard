/* Centralized toast helpers */
import { toast } from '@/components/ui/Toasts/use-toast';

export type ToastKind = 'success' | 'error' | 'info' | 'warning';

const variantMap: Record<
  ToastKind,
  { variant?: 'destructive'; defaultTitle: string }
> = {
  success: { defaultTitle: 'Success' },
  error: { variant: 'destructive', defaultTitle: 'Error' },
  info: { defaultTitle: 'Info' },
  warning: { defaultTitle: 'Warning' }
};

export function showToast(
  kind: ToastKind,
  message: string,
  opts?: { title?: string; action?: React.ReactNode }
) {
  const cfg = variantMap[kind];
  toast({
    title: opts?.title || cfg.defaultTitle,
    description: message,
    variant: cfg.variant,
    action: opts?.action as any
  });
}

export const toastHelpers = {
  success: (msg: string) => showToast('success', msg),
  error: (msg: string) => showToast('error', msg),
  info: (msg: string) => showToast('info', msg),
  warning: (msg: string) => showToast('warning', msg)
};
