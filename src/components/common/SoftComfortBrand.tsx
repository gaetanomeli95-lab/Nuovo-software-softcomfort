import { useState } from 'react';
import { cn } from '@/lib/utils';

const LOGO_URL =
  'https://raw.githubusercontent.com/gaetanomeli95-lab/SITO-SOFT-COMFORT/main/ChatGPT%20Image%2014%20mag%202026%2C%2018_40_10.png';

interface SoftComfortBrandProps {
  compact?: boolean;
  className?: string;
  imageClassName?: string;
  showTagline?: boolean;
}

export function SoftComfortBrand({
  compact = false,
  className,
  imageClassName,
  showTagline = true,
}: SoftComfortBrandProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      {!imageFailed ? (
        <img
          src={LOGO_URL}
          alt="Soft Comfort"
          className={cn(
            'h-10 w-10 shrink-0 rounded-xl object-cover shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_10px_30px_rgba(242,15,31,0.16)]',
            imageClassName,
          )}
          loading="eager"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div
          className={cn(
            'grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary/35 bg-primary/10 font-display text-sm font-bold text-primary',
            imageClassName,
          )}
          aria-label="Soft Comfort"
        >
          SC
        </div>
      )}

      {!compact && (
        <div className="min-w-0 leading-tight">
          <p className="font-display truncate text-[15px] font-bold tracking-tight text-foreground">
            Soft Comfort
          </p>
          {showTagline && (
            <p className="mt-0.5 truncate text-[9px] font-semibold uppercase tracking-[0.18em] text-brand-gold/[0.85]">
              Design · Comfort · Innovazione
            </p>
          )}
        </div>
      )}
    </div>
  );
}
