import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none transition-colors',
  {
    variants: {
      variant: {
        default: 'border-[#f3c8cb] bg-[#fff0f1] text-[#a70b15]',
        secondary: 'border-[#dfd8d0] bg-[#f1ede7] text-[#625853]',
        success: 'border-[#c7e2d2] bg-[#edf7f1] text-[#216a45]',
        warning: 'border-[#ead7b6] bg-[#fbf3e4] text-[#7d561c]',
        info: 'border-[#cbddea] bg-[#eef5fa] text-[#316a96]',
        destructive: 'border-[#efcbd0] bg-[#fff0f2] text-[#ae2631]',
        outline: 'border-[#ddd5cc] bg-white text-[#655c57]',
        muted: 'border-[#e5ded6] bg-[#f5f1ec] text-[#776e68]',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
