import type {
  BuyingBill,
  Check,
  DepositResponse,
  InventoryItem,
  PendingOrder,
  ProvisionResponse,
  SellingBill,
  SellingBillStatus,
} from '@/types/domain';

function item(
  id: string,
  name: string,
  price: number,
  company: string,
  ordered = true,
  arrived = true,
  delivered = false,
) {
  return { uuid: id, name, price, company, ordered, arrived, delivered };
}

function bill(
  uuid: string,
  date: string,
  seller: string,
  client: string,
  totalPrice: number,
  status: SellingBillStatus,
  items: ReturnType<typeof item>[],
  opts?: {
    transport?: number;
    settlement?: number;
    assistance?: boolean;
    notes?: string;
    deposits?: SellingBill['deposits'];
    provision?: SellingBill['provision'];
    address?: string;
    phone?: string;
  },
): SellingBill {
  const itemsPrice = items.reduce((sum, i) => sum + i.price, 0);
  return {
    uuid,
    date,
    seller,
    client,
    address: opts?.address ?? 'Palermo',
    phone: opts?.phone ?? '091 000 0000',
    status,
    delivered: status === 'Consegnata' || status === 'Chiusa',
    items,
    transport: opts?.transport ?? 0,
    itemsPrice,
    totalPrice,
    settlement: opts?.settlement ?? 0,
    assistance: opts?.assistance ?? false,
    notes: opts?.notes ?? '',
    deposits: opts?.deposits ?? [],
    provision: opts?.provision ?? null,
  };
}

export const demoSellingBills: SellingBill[] = [
  bill(
    'demo-sale-001',
    '2026-09-19',
    'Benedetto',
    'AMOROSO MARIA',
    4590,
    'Da Ordinare',
    [
      item('demo-item-001', 'Cucina Tilia 01', 1890, 'Soft Comfort', false, false, false),
      item('demo-item-002', 'Divano 3 posti premium', 1590, 'AD Sofa', false, false, false),
      item('demo-item-003', 'Tavolo + 4 sedie', 990, 'Target Point', false, false, false),
    ],
    {
      transport: 120,
      address: 'Via Libertà 112, Palermo',
      phone: '333 555 1920',
      notes: '[[SC_COMMISSION_V1:{"city":"Palermo","floor":"3","staircase":"A","elevator":"yes","measureSource":"seller","hoist":"no","attachments":"yes","attachmentPages":2,"scheduledDate":"2026-09-25","scheduledTime":"10:30"}]]\nConsegna da concordare dopo il completamento lavori.',
      deposits: [
        { uuid: 'demo-dep-001', date: '2026-09-19', seller: 'Benedetto', method: 'Pos', amount: 900, collected: true },
        { uuid: 'demo-dep-002', date: '2026-10-05', seller: 'Benedetto', method: 'Bonifico', amount: 600, collected: false },
      ],
      provision: { uuid: 'demo-prov-001', seller: 'Benedetto', amount: 229.5, payed: false },
    },
  ),
  bill(
    'demo-sale-002',
    '2026-09-18',
    'Stefania',
    'DI BERNARDO ERNESTO',
    2990,
    'Ordinato',
    [item('demo-item-004', 'Cucina Azalea 01', 2990, 'Soft Comfort', true, false, false)],
    {
      address: 'Bagheria (PA)',
      phone: '328 100 2020',
      notes: '[[SC_COMMISSION_V1:{"city":"Bagheria","floor":"1","staircase":"","elevator":"no","measureSource":"buyer","hoist":"yes","attachments":"no","attachmentPages":null,"scheduledDate":"2026-09-26","scheduledTime":"15:00"}]]\nContattare il cliente un’ora prima.',
      deposits: [
        { uuid: 'demo-dep-003', date: '2026-09-18', seller: 'Stefania', method: 'Contanti', amount: 500, collected: true },
      ],
      provision: { uuid: 'demo-prov-002', seller: 'Stefania', amount: 149.5, payed: true },
    },
  ),
  bill(
    'demo-sale-003',
    '2026-09-16',
    'Benedetto',
    'DI MICELI SALVATORE',
    2890,
    'Pronta',
    [item('demo-item-005', 'Cucina Mirta 03', 2890, 'Soft Comfort', true, true, false)],
    {
      address: 'Via Messina Marine 88, Palermo',
      phone: '329 222 1144',
      notes: '[[SC_COMMISSION_V1:{"city":"Palermo","floor":"4","staircase":"C","elevator":"no","measureSource":"seller","hoist":"yes","attachments":"yes","attachmentPages":1,"scheduledDate":"2026-09-23","scheduledTime":"09:00"}]]\nVerificare accesso autoscala prima della partenza.',
      deposits: [
        { uuid: 'demo-dep-004', date: '2026-09-16', seller: 'Benedetto', method: 'Bonifico', amount: 1000, collected: true },
      ],
      provision: { uuid: 'demo-prov-003', seller: 'Benedetto', amount: 144.5, payed: false },
    },
  ),
  bill(
    'demo-sale-004',
    '2026-09-14',
    'Stefania',
    'RUSSO GIULIA',
    5790,
    'Consegnata',
    [
      item('demo-item-006', 'Camera matrimoniale completa', 2490, 'Orme', true, true, true),
      item('demo-item-007', 'Divano angolare', 1890, 'AD Sofa', true, true, true),
      item('demo-item-008', 'Parete attrezzata', 1410, 'Maronese', true, true, true),
    ],
    {
      assistance: true,
      address: 'Via Dante 25, Bagheria',
      phone: '333 414 8810',
      notes: '[[SC_COMMISSION_V1:{"city":"Bagheria","floor":"2","staircase":"","elevator":"yes","measureSource":"seller","hoist":"no","attachments":"no","attachmentPages":null,"scheduledDate":"2026-09-20","scheduledTime":"11:00"}]]\nConsegna completata senza anomalie.',
      deposits: [
        { uuid: 'demo-dep-005', date: '2026-09-01', seller: 'Stefania', method: 'Pos', amount: 1200, collected: true },
        { uuid: 'demo-dep-006', date: '2026-09-14', seller: 'Stefania', method: 'Bonifico', amount: 4590, collected: true },
      ],
      provision: { uuid: 'demo-prov-004', seller: 'Stefania', amount: 289.5, payed: true },
    },
  ),
  bill(
    'demo-sale-005',
    '2026-09-08',
    'Benedetto',
    'LOMBARDO ANTONINO',
    2390,
    'Chiusa',
    [item('demo-item-009', 'Cucina Melia 02', 2390, 'Soft Comfort', true, true, true)],
    {
      deposits: [
        { uuid: 'demo-dep-007', date: '2026-08-20', seller: 'Benedetto', method: 'Contanti', amount: 500, collected: true },
      ],
      provision: { uuid: 'demo-prov-005', seller: 'Benedetto', amount: 119.5, payed: true },
    },
  ),
  bill('demo-sale-006', '2026-08-23', 'Stefania', 'FERRARA CLAUDIA', 6890, 'Chiusa',
    [item('demo-item-010', 'Arredamento completo trilocale', 6890, 'Soft Comfort', true, true, true)]),
  bill('demo-sale-007', '2026-08-04', 'Benedetto', 'MANCUSO PAOLO', 3490, 'Consegnata',
    [item('demo-item-011', 'Camera + materasso', 3490, 'Orme', true, true, true)]),
  bill('demo-sale-008', '2026-07-22', 'Stefania', 'GIORDANO ELENA', 4890, 'Chiusa',
    [item('demo-item-012', 'Soggiorno completo', 4890, 'Maronese', true, true, true)]),
  bill('demo-sale-009', '2026-06-15', 'Benedetto', 'CARUSO ROBERTO', 8290, 'Chiusa',
    [item('demo-item-013', 'Cucina + living', 8290, 'Soft Comfort', true, true, true)]),
  bill('demo-sale-010', '2026-05-11', 'Stefania', 'VITALE MARTA', 7290, 'Chiusa',
    [item('demo-item-014', 'Arredo zona giorno e notte', 7290, 'Soft Comfort', true, true, true)]),
  bill('demo-sale-011', '2026-04-09', 'Benedetto', 'PIRAINO LUCA', 4120, 'Chiusa',
    [item('demo-item-015', 'Divano + parete TV', 4120, 'AD Sofa', true, true, true)]),
  bill('demo-sale-012', '2026-03-17', 'Stefania', 'ROMANO SILVIA', 5980, 'Chiusa',
    [item('demo-item-016', 'Cucina Cedra 01 + tavolo', 5980, 'Soft Comfort', true, true, true)]),
  bill('demo-sale-013', '2026-02-12', 'Benedetto', 'MARINO FABIO', 3650, 'Chiusa',
    [item('demo-item-017', 'Camera completa', 3650, 'Orme', true, true, true)]),
  bill('demo-sale-014', '2026-01-19', 'Stefania', 'GRECO ANNA', 4450, 'Chiusa',
    [item('demo-item-018', 'Living completo', 4450, 'Maronese', true, true, true)]),
  bill('demo-sale-015', '2025-12-18', 'Benedetto', 'COSTA FRANCESCO', 5090, 'Chiusa',
    [item('demo-item-019', 'Cucina + elettrodomestici', 5090, 'Soft Comfort', true, true, true)]),
];

export const demoBuyingBills: BuyingBill[] = [
  {
    uuid: 'demo-buy-001',
    date: '2026-09-12',
    make: 'Soft Italia S.p.A.',
    status: 'Aperta',
    items: [
      { uuid: 'demo-buy-item-001', name: 'Cucina Tilia 01', price: 1190 },
      { uuid: 'demo-buy-item-002', name: 'Cucina Azalea 01', price: 1820 },
    ],
  },
  {
    uuid: 'demo-buy-002',
    date: '2026-09-04',
    make: 'AD Sofa',
    status: 'Chiusa',
    items: [
      { uuid: 'demo-buy-item-003', name: 'Divano angolare premium', price: 980 },
      { uuid: 'demo-buy-item-004', name: 'Divano 3 posti', price: 740 },
    ],
  },
  {
    uuid: 'demo-buy-003',
    date: '2026-08-26',
    make: 'Maronese ACF',
    status: 'Aperta',
    items: [
      { uuid: 'demo-buy-item-005', name: 'Parete attrezzata composizione 04', price: 790 },
    ],
  },
];

export const demoChecks: Check[] = [
  { uuid: 'demo-check-001', make: 'Cliente Amoroso', expireDate: '2026-09-30', amount: 1800, billNumbers: 'SC-2026/412' },
  { uuid: 'demo-check-002', make: 'Cliente Giordano', expireDate: '2026-10-15', amount: 2450, billNumbers: 'SC-2026/389' },
  { uuid: 'demo-check-003', make: 'Cliente Romano', expireDate: '2026-11-08', amount: 1200, billNumbers: 'SC-2026/351' },
  { uuid: 'demo-check-004', make: 'Cliente Ferrara', expireDate: '2026-08-30', amount: 900, billNumbers: 'SC-2026/340' },
];

export const demoInventoryAvailable: InventoryItem[] = [
  { uuid: 'demo-stock-001', make: 'AD Sofa', ref: 'DIVA-590', name: 'Divano 3 posti tortora', bPrice: 590, necks: '1', location: 'Bagheria · Zona A', delivered: false },
  { uuid: 'demo-stock-002', make: 'Soft Italia', ref: 'TILIA-01', name: 'Cucina Tilia 01', bPrice: 1890, necks: '7', location: 'Palermo · Zona C', delivered: false },
  { uuid: 'demo-stock-003', make: 'Maronese', ref: 'LIV-042', name: 'Parete attrezzata rovere', bPrice: 1190, necks: '4', location: 'Bagheria · Zona B', delivered: false },
  { uuid: 'demo-stock-004', make: 'Orme', ref: 'CAM-118', name: 'Camera matrimoniale completa', bPrice: 2290, necks: '8', location: 'Palermo · Zona D', delivered: false },
];

export const demoInventoryDelivered: InventoryItem[] = [
  { uuid: 'demo-stock-005', make: 'Soft Italia', ref: 'MELIA-02', name: 'Cucina Melia 02', bPrice: 2390, necks: '6', location: 'Palermo', delivered: true },
  { uuid: 'demo-stock-006', make: 'AD Sofa', ref: 'ANG-204', name: 'Divano angolare', bPrice: 1490, necks: '2', location: 'Bagheria', delivered: true },
];

export const demoPending: PendingOrder[] = [
  { uuid: 'demo-pending-001', name: 'Cucina Tilia 01 — Amoroso Maria', price: 1890, ordered: false, company: 'Soft Italia', arrived: false, delivered: false },
  { uuid: 'demo-pending-002', name: 'Cucina Azalea 01 — Di Bernardo Ernesto', price: 2990, ordered: true, company: 'Soft Italia', arrived: false, delivered: false },
  { uuid: 'demo-pending-003', name: 'Divano angolare — Russo Giulia', price: 1890, ordered: true, company: 'AD Sofa', arrived: true, delivered: false },
];

export function demoDeposits(collected: boolean): DepositResponse[] {
  return demoSellingBills.flatMap((b) =>
    (b.deposits ?? [])
      .filter((d) => d.collected === collected)
      .map((deposit) => ({ deposit, client: b.client, uuid: b.uuid })),
  );
}

export function demoProvisions(payed: boolean): ProvisionResponse[] {
  return demoSellingBills.flatMap((b) =>
    b.provision && b.provision.payed === payed
      ? [{ provision: b.provision, client: b.client, uuid: b.uuid }]
      : [],
  );
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

export async function handleDemoRequest<T>(
  path: string,
  method: string,
): Promise<T> {
  // breve pausa per rendere il caricamento realistico senza dipendere dalla rete
  await new Promise((resolve) => setTimeout(resolve, 90));

  if (method !== 'GET') {
    return undefined as T;
  }

  if (path === '/sellingBill/getAll') return clone(demoSellingBills) as T;
  if (path.startsWith('/sellingBill/')) {
    const id = path.split('/').pop();
    return clone(demoSellingBills.find((b) => b.uuid === id) ?? demoSellingBills[0]) as T;
  }

  if (path === '/buyingBill/getAll') return clone(demoBuyingBills) as T;
  if (path.startsWith('/buyingBill/')) {
    const id = path.split('/').pop();
    return clone(demoBuyingBills.find((b) => b.uuid === id) ?? demoBuyingBills[0]) as T;
  }

  if (path === '/checks/all') return clone(demoChecks) as T;
  if (path === '/deposits/toCollect') return { depositResponses: clone(demoDeposits(false)) } as T;
  if (path === '/deposits/collected') return { depositResponses: clone(demoDeposits(true)) } as T;
  if (path === '/provisions/toPay') return { provisionResponses: clone(demoProvisions(false)) } as T;
  if (path === '/provisions/payed') return { provisionResponses: clone(demoProvisions(true)) } as T;
  if (path === '/item/getAllAvailable') return clone(demoInventoryAvailable) as T;
  if (path === '/item/getDelivered') return clone(demoInventoryDelivered) as T;
  if (path === '/pending/all') return clone(demoPending) as T;
  if (path.startsWith('/pending/')) {
    const id = path.split('/').pop();
    return clone(demoPending.find((o) => o.uuid === id) ?? demoPending[0]) as T;
  }

  return undefined as T;
}
