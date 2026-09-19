import { cn } from '@/lib/utils';

interface SummaryPillProps {
  label: string;
  value: string;
  tone?: 'gold' | 'red' | 'neutral' | 'green';
  className?: string;
}

const tones = {
  gold: 'border-[#e8d7b9] bg-[#fbf5e9] text-[#7b551d]',
  red: 'border-[#f0c9cc] bg-[#fff1f2] text-[#9f1119]',
  neutral: 'border-[#dfd7cf] bg-white text-[#4b433f]',
  green: 'border-[#c8e1d2] bg-[#eff7f2] text-[#266a46]',
};

export function SummaryPill({ label, value, tone = 'neutral', className }: SummaryPillProps) {
  return (
    <div className={cn('min-w-[150px] rounded-xl border px-3.5 py-2.5', tones[tone], className)}>
      <p className="text-[9px] font-bold uppercase tracking-[0.13em] opacity-70">{label}</p>
      <p className="tnum mt-1 text-[15px] font-bold leading-none">{value}</p>
    </div>
  );
}
