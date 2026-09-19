import * as React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[96px] w-full rounded-xl border border-input bg-white px-3 py-2.5 text-sm text-foreground shadow-[0_1px_2px_rgba(55,42,34,0.03)] transition-all',
        'placeholder:text-[#9b918a]',
        'focus-visible:border-primary/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/10',
        'disabled:cursor-not-allowed disabled:bg-[#f3efe9] disabled:opacity-60',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

export { Textarea };
