import type { WorkPriority } from './operationsInbox';

export function priorityVariant(priority: WorkPriority) {
  if (priority === 'critical') return 'destructive' as const;
  if (priority === 'warning') return 'warning' as const;
  if (priority === 'positive') return 'success' as const;
  return 'outline' as const;
}

export function priorityLabel(priority: WorkPriority) {
  if (priority === 'critical') return 'Urgente';
  if (priority === 'warning') return 'Attenzione';
  if (priority === 'positive') return 'Pronta';
  return 'Da fare';
}
