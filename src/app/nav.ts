import {
  LayoutDashboard,
  BarChart3,
  ClipboardCheck,
  ReceiptText,
  ShoppingCart,
  Package,
  Clock,
  CalendarDays,
  PiggyBank,
  Landmark,
  HandCoins,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Solo admin */
  adminOnly?: boolean;
}

export interface NavSection {
  title: string;
  description: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Panoramica',
    description: 'Controllo generale dell’attività.',
    items: [
      {
        to: '/dashboard',
        label: 'Dashboard',
        description: 'Numeri, vendite, scadenze e andamento dell’attività in un’unica vista.',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'Analisi',
    description: 'Report, performance ed esportazione dati.',
    items: [
      {
        to: '/report',
        label: 'Report e export',
        description: 'Analizza vendite e venditori, poi esporta i dati in CSV.',
        icon: BarChart3,
      },
    ],
  },
  {
    title: 'Operatività',
    description: 'Le attività che richiedono attenzione oggi.',
    items: [
      {
        to: '/attivita',
        label: 'Da fare',
        description: 'Urgenze, consegne, incassi e attività aperte in ordine di priorità.',
        icon: ClipboardCheck,
      },
    ],
  },
  {
    title: 'Vendite',
    description: 'Bolle, vendite e ordini da seguire.',
    items: [
      {
        to: '/vendite',
        label: 'Fatture vendita',
        description: 'Consulta, cerca e gestisci tutte le vendite.',
        icon: ReceiptText,
      },
      {
        to: '/ordini',
        label: 'Ordini in sospeso',
        description: 'Controlla ordini, arrivi e consegne ancora aperte.',
        icon: Clock,
      },
      {
        to: '/consegne',
        label: 'Planning consegne',
        description: 'Programma consegne, orari e condizioni logistiche dei clienti.',
        icon: CalendarDays,
      },
    ],
  },
  {
    title: 'Anagrafiche',
    description: 'Clienti e fornitori in un’unica vista.',
    items: [
      {
        to: '/anagrafiche',
        label: 'Clienti e fornitori',
        description: 'Consulta lo storico clienti e i fornitori ricavati dai dati operativi.',
        icon: Users,
      },
    ],
  },
  {
    title: 'Acquisti e magazzino',
    description: 'Fornitori, merce e disponibilità.',
    items: [
      {
        to: '/acquisti',
        label: 'Fatture acquisto',
        description: 'Consulta i documenti di acquisto dai fornitori.',
        icon: ShoppingCart,
      },
      {
        to: '/magazzino',
        label: 'Giacenze',
        description: 'Controlla articoli, disponibilità e ubicazioni.',
        icon: Package,
      },
    ],
  },
  {
    title: 'Contabilità',
    description: 'Incassi, scadenze e provvigioni.',
    items: [
      {
        to: '/acconti',
        label: 'Acconti',
        description: 'Gestisci gli acconti incassati e quelli da incassare.',
        icon: PiggyBank,
      },
      {
        to: '/assegni',
        label: 'Assegni',
        description: 'Controlla importi, riferimenti e scadenze.',
        icon: Landmark,
      },
      {
        to: '/provvigioni',
        label: 'Provvigioni',
        description: 'Gestisci le provvigioni dei venditori.',
        icon: HandCoins,
      },
    ],
  },
  {
    title: 'Sistema',
    description: 'Funzioni riservate e configurazione.',
    items: [
      {
        to: '/amministrazione',
        label: 'Amministrazione',
        description: 'Impostazioni e funzioni riservate agli amministratori.',
        icon: Settings,
        adminOnly: true,
      },
    ],
  },
];
