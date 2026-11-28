import {
  LayoutDashboard,
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

/**
 * Menu del gestionale: tre gruppi.
 * Le aree contabili (decisione del titolare del 27/11/2026) sono riservate all'admin:
 * i PC operativi non le vedono nel menu e le route le rimandano alla home.
 * Il blocco reale va comunque verificato anche sul backend (vedi docs/STATO_PROGETTO.md).
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Negozio',
    description: 'Il lavoro di tutti i giorni: cose da fare, vendite e clienti.',
    items: [
      {
        to: '/attivita',
        label: 'Da fare',
        description: 'Urgenze, consegne di oggi e vendite da seguire, in ordine di priorità.',
        icon: ClipboardCheck,
      },
      {
        to: '/vendite',
        label: 'Vendite',
        description: 'Consulta, cerca e crea le vendite.',
        icon: ReceiptText,
      },
      {
        to: '/anagrafiche',
        label: 'Clienti e fornitori',
        description: 'Schede clienti con storico vendite e fornitori.',
        icon: Users,
      },
    ],
  },
  {
    title: 'Consegne e magazzino',
    description: 'Merce da ordinare, consegne e giacenze.',
    items: [
      {
        to: '/consegne',
        label: 'Planning consegne',
        description: 'Programma consegne, orari e note per i clienti.',
        icon: CalendarDays,
      },
      {
        to: '/ordini',
        label: 'Ordini in sospeso',
        description: 'Articoli da ordinare, arrivati e consegnati.',
        icon: Clock,
      },
      {
        to: '/magazzino',
        label: 'Giacenze',
        description: 'Articoli in magazzino, disponibilità e ubicazioni.',
        icon: Package,
      },
    ],
  },
  {
    title: 'Amministratore',
    description: 'Contabilità e numeri dell’attività. Visibile solo sul PC amministratore.',
    items: [
      {
        to: '/dashboard',
        label: 'Dashboard',
        description: 'Fatturato, vendite e andamento dell’attività.',
        icon: LayoutDashboard,
        adminOnly: true,
      },
      {
        to: '/acquisti',
        label: 'Fatture acquisto',
        description: 'Documenti di acquisto dai fornitori.',
        icon: ShoppingCart,
        adminOnly: true,
      },
      {
        to: '/acconti',
        label: 'Acconti',
        description: 'Acconti incassati e da incassare.',
        icon: PiggyBank,
        adminOnly: true,
      },
      {
        to: '/assegni',
        label: 'Assegni',
        description: 'Importi, riferimenti e scadenze.',
        icon: Landmark,
        adminOnly: true,
      },
      {
        to: '/provvigioni',
        label: 'Provvigioni',
        description: 'Provvigioni dei venditori.',
        icon: HandCoins,
        adminOnly: true,
      },
      {
        to: '/amministrazione',
        label: 'Impostazioni',
        description: 'Controlli tecnici e configurazione del gestionale.',
        icon: Settings,
        adminOnly: true,
      },
    ],
  },
];

/** Gruppi e voci visibili per l'utente: le voci admin spariscono per gli operatori. */
export function visibleNavSections(isAdmin: boolean): NavSection[] {
  return NAV_SECTIONS
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.adminOnly || isAdmin),
    }))
    .filter((section) => section.items.length > 0);
}
