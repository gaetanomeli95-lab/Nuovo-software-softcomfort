import { createContext, useContext, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TabsCtx {
  value: string;
  setValue: (v: string) => void;
}
const Ctx = createContext<TabsCtx | null>(null);

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
  const [internal, setInternal] = useState(defaultValue ?? '');
  const current = value ?? internal;
  const setValue = (v: string) => {
    setInternal(v);
    onValueChange?.(v);
  };
  return (
    <Ctx.Provider value={{ value: current, setValue }}>
      <div className={className}>{children}</div>
    </Ctx.Provider>
  );
}

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-xl border border-[#e0d8cf] bg-[#f1ece6] p-1 text-muted-foreground',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('TabsTrigger deve stare dentro <Tabs>');
  const active = ctx.value === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => ctx.setValue(value)}
      className={cn(
        'inline-flex h-8 items-center justify-center whitespace-nowrap rounded-lg px-3 text-sm font-semibold transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'bg-white text-foreground shadow-[0_1px_4px_rgba(60,45,36,0.09)]'
          : 'hover:bg-white/45 hover:text-foreground',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('TabsContent deve stare dentro <Tabs>');
  if (ctx.value !== value) return null;
  return (
    <div role="tabpanel" className={cn('mt-4', className)}>
      {children}
    </div>
  );
}
