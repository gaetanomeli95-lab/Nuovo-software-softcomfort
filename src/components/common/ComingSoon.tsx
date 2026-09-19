import { Wrench } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { EmptyState } from './EmptyState';
import { Card } from '@/components/ui/card';

/** Placeholder per i moduli non ancora migrati (Fase 2+). */
export function ComingSoon({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-4">
      <PageHeader title={title} description={description} />
      <Card>
        <EmptyState
          icon={Wrench}
          title="Modulo in migrazione"
          description="Questa sezione sarà disponibile nella prossima fase. I dati restano accessibili dall'applicazione legacy."
        />
      </Card>
    </div>
  );
}
