import {
  demoBuyingBills,
  demoChecks,
  demoInventoryAvailable,
  demoInventoryDelivered,
  demoPending,
  demoSellingBills,
} from '@/services/demoData';
import type {
  BuyingBill,
  Check,
  Deposit,
  DepositResponse,
  InventoryItem,
  PendingOrder,
  ProvisionResponse,
  SellingBill,
  SellingBillItem,
} from '@/types/domain';

let sales: SellingBill[] = structuredClone(demoSellingBills);
let buyingBills: BuyingBill[] = structuredClone(demoBuyingBills);
let checks: Check[] = structuredClone(demoChecks);
let inventoryAvailable: InventoryItem[] = structuredClone(demoInventoryAvailable);
let inventoryDelivered: InventoryItem[] = structuredClone(demoInventoryDelivered);
let pending: PendingOrder[] = structuredClone(demoPending);
let idCounter = 1000;

function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

function bodyObject(body: unknown): Record<string, unknown> {
  return body && typeof body === 'object' ? body as Record<string, unknown> : {};
}

function getSale(uuid: unknown): SellingBill | undefined {
  return sales.find((bill) => bill.uuid === uuid);
}

function recalcOperationalStatus(bill: SellingBill) {
  if (bill.status === 'Annullata' || bill.status === 'Chiusa') return;

  const items = bill.items ?? [];
  if (items.length === 0) {
    bill.status = 'Da Ordinare';
    bill.delivered = false;
    return;
  }

  const allDelivered = items.every((item) => item.delivered);
  const allArrived = items.every((item) => item.arrived);
  const allOrdered = items.every((item) => item.ordered);

  bill.delivered = allDelivered;
  if (allDelivered) bill.status = 'Consegnata';
  else if (allArrived) bill.status = 'Pronta';
  else if (allOrdered) bill.status = 'Ordinato';
  else bill.status = 'Da Ordinare';
}

function depositResponses(collected: boolean): DepositResponse[] {
  return sales.flatMap((bill) =>
    (bill.deposits ?? [])
      .filter((deposit) => deposit.collected === collected)
      .map((deposit) => ({
        deposit,
        client: bill.client,
        uuid: bill.uuid,
      })),
  );
}

function provisionResponses(payed: boolean): ProvisionResponse[] {
  return sales.flatMap((bill) =>
    bill.provision && bill.provision.payed === payed
      ? [{ provision: bill.provision, client: bill.client, uuid: bill.uuid }]
      : [],
  );
}

function updateItem(
  sale: SellingBill,
  itemUUID: unknown,
  updater: (item: SellingBillItem) => void,
) {
  const item = sale.items.find((candidate) => candidate.uuid === itemUUID);
  if (!item) return;
  updater(item);
  recalcOperationalStatus(sale);
}

function findInventory(uuid: unknown) {
  return (
    inventoryAvailable.find((item) => item.uuid === uuid) ??
    inventoryDelivered.find((item) => item.uuid === uuid)
  );
}

export async function handleDemoRequest<T>(
  path: string,
  method: string,
  body?: unknown,
): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, 70));

  if (method === 'GET') {
    if (path === '/sellingBill/getAll') return structuredClone(sales) as T;
    if (path.startsWith('/sellingBill/')) {
      const id = path.split('/').pop();
      return structuredClone(sales.find((bill) => bill.uuid === id) ?? sales[0]) as T;
    }

    if (path === '/buyingBill/getAll') return structuredClone(buyingBills) as T;
    if (path.startsWith('/buyingBill/')) {
      const id = path.split('/').pop();
      return structuredClone(buyingBills.find((bill) => bill.uuid === id) ?? buyingBills[0]) as T;
    }

    if (path === '/checks/all') return structuredClone(checks) as T;
    if (path === '/deposits/toCollect') {
      return { depositResponses: structuredClone(depositResponses(false)) } as T;
    }
    if (path === '/deposits/collected') {
      return { depositResponses: structuredClone(depositResponses(true)) } as T;
    }
    if (path === '/provisions/toPay') {
      return { provisionResponses: structuredClone(provisionResponses(false)) } as T;
    }
    if (path === '/provisions/payed') {
      return { provisionResponses: structuredClone(provisionResponses(true)) } as T;
    }
    if (path === '/item/getAllAvailable') return structuredClone(inventoryAvailable) as T;
    if (path === '/item/getDelivered') return structuredClone(inventoryDelivered) as T;
    if (path === '/pending/all') return structuredClone(pending) as T;
    if (path.startsWith('/pending/')) {
      const id = path.split('/').pop();
      return structuredClone(pending.find((order) => order.uuid === id) ?? pending[0]) as T;
    }

    return undefined as T;
  }

  const data = bodyObject(body);

  if (path === '/sellingBill/addItem' && method === 'PATCH') {
    const sale = getSale(data.uuid);
    if (sale) {
      sale.items.push({
        uuid: nextId('demo-item'),
        name: String(data.name ?? 'Nuovo articolo'),
        price: Number(data.price ?? 0),
        ordered: false,
        company: '',
        arrived: false,
        delivered: false,
      });
      sale.itemsPrice = sale.items.reduce((sum, item) => sum + item.price, 0);
      sale.totalPrice = sale.itemsPrice + (sale.transport ?? 0);
      recalcOperationalStatus(sale);
    }
    return undefined as T;
  }

  if (path === '/sellingBill/removeItem' && method === 'PATCH') {
    const sale = getSale(data.uuid);
    if (sale) {
      sale.items = sale.items.filter((item) => item.uuid !== data.itemUUID);
      sale.itemsPrice = sale.items.reduce((sum, item) => sum + item.price, 0);
      sale.totalPrice = sale.itemsPrice + (sale.transport ?? 0);
      recalcOperationalStatus(sale);
    }
    return undefined as T;
  }

  if (path === '/sellingBill/setOrdered' && method === 'PATCH') {
    const sale = getSale(data.uuid);
    if (sale) {
      updateItem(sale, data.itemUUID, (item) => {
        item.ordered = Boolean(data.state);
        if (!item.ordered) {
          item.arrived = false;
          item.delivered = false;
        }
      });
    }
    return undefined as T;
  }

  if (path === '/sellingBill/setArrived' && method === 'PATCH') {
    const sale = getSale(data.uuid);
    if (sale) {
      updateItem(sale, data.itemUUID, (item) => {
        item.arrived = Boolean(data.arrived);
        if (item.arrived) item.ordered = true;
        if (!item.arrived) item.delivered = false;
      });
    }
    return undefined as T;
  }

  if (path === '/sellingBill/setDelivered' && method === 'PATCH') {
    const sale = getSale(data.uuid);
    if (sale) {
      updateItem(sale, data.itemUUID, (item) => {
        item.delivered = Boolean(data.delivered);
        if (item.delivered) {
          item.ordered = true;
          item.arrived = true;
        }
      });
    }
    return undefined as T;
  }

  if (path === '/sellingBill/setCompany' && method === 'PATCH') {
    const sale = getSale(data.uuid);
    if (sale) {
      updateItem(sale, data.itemUUID, (item) => {
        item.company = String(data.company ?? '');
      });
    }
    return undefined as T;
  }

  if (path === '/sellingBill/setAssistance' && method === 'PATCH') {
    const sale = getSale(data.uuid);
    if (sale) sale.assistance = Boolean(data.isAssistance);
    return undefined as T;
  }

  if (path === '/sellingBill/setProvision' && method === 'PATCH') {
    const sale = getSale(data.uuid);
    if (sale && !sale.provision) {
      sale.provision = {
        uuid: nextId('demo-prov'),
        seller: sale.seller,
        amount: Math.round((sale.totalPrice ?? 0) * 0.05 * 100) / 100,
        payed: false,
      };
    }
    return undefined as T;
  }

  if (path === '/sellingBill/updateNotes' && method === 'PATCH') {
    const sale = getSale(data.uuid);
    if (sale) sale.notes = String(data.notes ?? '');
    return undefined as T;
  }

  if (path === '/sellingBill/addDeposit' && method === 'POST') {
    const sale = getSale(data.uuid);
    if (sale) {
      const deposit: Deposit = {
        uuid: nextId('demo-dep'),
        date: String(data.date ?? new Date().toISOString().slice(0, 10)),
        seller: String(data.seller ?? sale.seller),
        method: String(data.method ?? 'Contanti'),
        amount: Number(data.amount ?? 0),
        collected: false,
      };
      sale.deposits.push(deposit);
    }
    return undefined as T;
  }

  if (path === '/sellingBill/removeDeposit' && method === 'PATCH') {
    const sale = getSale(data.uuid);
    if (sale) {
      const index = sale.deposits.findIndex(
        (deposit) => Math.abs(deposit.amount - Number(data.amount ?? 0)) < 0.001,
      );
      if (index >= 0) sale.deposits.splice(index, 1);
    }
    return undefined as T;
  }

  if (path === '/sellingBill/cancel' && method === 'PUT') {
    const sale = getSale(data.uuid);
    if (sale) sale.status = 'Annullata';
    return undefined as T;
  }

  if (path.startsWith('/sellingBill/delete/') && method === 'DELETE') {
    const uuid = path.split('/').pop();
    sales = sales.filter((bill) => bill.uuid !== uuid);
    return undefined as T;
  }

  if (path === '/deposits/setCollected' && method === 'PATCH') {
    for (const sale of sales) {
      const deposit = sale.deposits.find((candidate) => candidate.uuid === data.uuid);
      if (deposit) {
        deposit.collected = true;
        break;
      }
    }
    return undefined as T;
  }

  if (path === '/provisions/setPayed' && method === 'PATCH') {
    for (const sale of sales) {
      const provision = sale.provision;
      if (provision && provision.uuid === data.uuid) {
        provision.payed = true;
        break;
      }
    }
    return undefined as T;
  }

  if (path === '/checks/add' && method === 'POST') {
    checks.push({
      uuid: nextId('demo-check'),
      make: String(data.make ?? 'Nuovo assegno'),
      expireDate: String(data.expireDate ?? new Date().toISOString().slice(0, 10)),
      amount: Number(data.amount ?? 0),
      billNumbers: data.billNumbers ? String(data.billNumbers) : null,
    });
    return undefined as T;
  }

  if (path.startsWith('/checks/delete/') && method === 'DELETE') {
    const uuid = path.split('/').pop();
    checks = checks.filter((check) => check.uuid !== uuid);
    return undefined as T;
  }

  if (path === '/pending/add' && method === 'POST') {
    pending.push({
      uuid: nextId('demo-pending'),
      name: String(data.name ?? 'Nuovo ordine'),
      ordered: false,
      arrived: false,
      delivered: false,
    });
    return undefined as T;
  }

  if (path === '/pending/update' && method === 'POST') {
    const order = pending.find((candidate) => candidate.uuid === data.uuid);
    if (order) Object.assign(order, data);
    return undefined as T;
  }

  if (path.startsWith('/pending/delete/') && method === 'DELETE') {
    const uuid = path.split('/').pop();
    pending = pending.filter((order) => order.uuid !== uuid);
    return undefined as T;
  }

  if (path === '/item/updateDelivered' && method === 'PUT') {
    const index = inventoryAvailable.findIndex((item) => item.uuid === data.uuid);
    if (index >= 0) {
      const [moved] = inventoryAvailable.splice(index, 1);
      moved.delivered = true;
      inventoryDelivered.unshift(moved);
    }
    return undefined as T;
  }

  if (path === '/item/updateLocation' && method === 'PUT') {
    const item = findInventory(data.uuid);
    if (item) item.location = String(data.location ?? '');
    return undefined as T;
  }

  if (path === '/item/updateName' && method === 'PUT') {
    const item = findInventory(data.uuid);
    if (item) item.name = String(data.name ?? '');
    return undefined as T;
  }

  if (path === '/item/updateRef' && method === 'PUT') {
    const item = findInventory(data.uuid);
    if (item) item.ref = String(data.ref ?? '');
    return undefined as T;
  }

  if (path === '/item/add' && method === 'POST') {
    const items = Array.isArray(data.items) ? data.items : [];
    for (const raw of items) {
      const item = bodyObject(raw);
      inventoryAvailable.push({
        uuid: nextId('demo-stock'),
        make: String(item.make ?? ''),
        ref: String(item.ref ?? ''),
        name: String(item.name ?? item.item ?? 'Nuovo articolo'),
        bPrice: Number(item.bPrice ?? 0),
        necks: item.necks ? String(item.necks) : null,
        location: item.location ? String(item.location) : null,
        delivered: false,
        quantity: item.quantity ? Number(item.quantity) : undefined,
      });
    }
    return undefined as T;
  }

  if (path.startsWith('/buyingBill/delete/') && method === 'DELETE') {
    const uuid = path.split('/').pop();
    buyingBills = buyingBills.filter((bill) => bill.uuid !== uuid);
    return undefined as T;
  }

  return undefined as T;
}
