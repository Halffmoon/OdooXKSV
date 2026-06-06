import 'dotenv/config';
import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('Database connected.');

    const quotations = await prisma.quotation.findMany({
      include: { items: true, vendor: true }
    });
    console.log('\n--- QUOTATIONS ---');
    console.log(quotations.map(q => ({
      id: q.id,
      rfq_id: q.rfq_id,
      vendor: q.vendor?.company_name || 'unknown',
      total_amount: q.total_amount,
      status: q.status,
      items_count: q.items?.length || 0
    })));

    const pos = await prisma.purchaseOrder.findMany({
      include: { items: true }
    });
    console.log('\n--- PURCHASE ORDERS ---');
    console.log(pos.map(po => ({
      id: po.id,
      po_number: po.po_number,
      quotation_id: po.quotation_id,
      total_amount: po.total_amount,
      status: po.status,
      items_count: po.items?.length || 0
    })));

    const invoices = await prisma.invoice.findMany({
      include: { purchase_order: true }
    });
    console.log('\n--- INVOICES (BILLS) ---');
    console.log(invoices.map(i => ({
      id: i.id,
      invoice_number: i.invoice_number,
      po_id: i.po_id,
      po_number: i.purchase_order?.po_number,
      grand_total: i.grand_total,
      status: i.status
    })));

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
