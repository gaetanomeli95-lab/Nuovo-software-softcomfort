import {
  LayoutDashboard,
  ReceiptText,
  ShoppingCart,
  Package,
  Clock,
  CalendarDays,
  PiggyBank,
  Landmark,
  HandCoins,
  Settings,
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
