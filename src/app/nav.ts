import {
  LayoutDashboard,
  ReceiptText,
  ShoppingCart,
  Package,
  Clock,
  PiggyBank,
  Landmark,
  HandCoins,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Solo admin */
  adminOnly?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Vendite',
    items: [
      { to: '/vendite', label: 'Fatture vendita', icon: ReceiptText },
      { to: '/ordini', label: 'Ordini in sospeso', icon: Clock },
    ],
  },
  {
    title: 'Acquisti e magazzino',
    items: [
      { to: '/acquisti', label: 'Fatture acquisto', icon: ShoppingCart },
      { to: '/magazzino', label: 'Giacenze', icon: Package },
    ],
  },
  {
    title: 'Contabilità',
    items: [
      { to: '/acconti', label: 'Acconti', icon: PiggyBank },
      { to: '/assegni', label: 'Assegni', icon: Landmark },
      { to: '/provvigioni', label: 'Provvigioni', icon: HandCoins },
    ],
  },
  {
    title: 'Sistema',
    items: [{ to: '/amministrazione', label: 'Amministrazione', icon: Settings, adminOnly: true }],
  },
];
