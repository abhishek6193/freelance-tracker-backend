import PDFDocument from 'pdfkit';
import { IInvoice } from '../models/Invoice';
import { Response } from 'express';
import path from 'path';
import fs from 'fs';

export function generateInvoicePDF(invoice: IInvoice, user: any, res: Response) {
  const doc = new PDFDocument({ margin: 50 });
  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);

  doc.pipe(res);

  fillInvoicePDF(doc, invoice, user);

  doc.end();
}

export function generateInvoicePDFBuffer(invoice: IInvoice, user: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    fillInvoicePDF(doc, invoice, user);

    doc.end();
  });
}

function fillInvoicePDF(doc: PDFKit.PDFDocument, invoice: IInvoice, user: any) {
  // App name
  doc.fontSize(20).text('Freelance Tracker', 110, 57);
  doc.moveDown();

  // User info
  doc.fontSize(12).text(`From: ${user.name} <${user.email}>`);
  if (user.llp) doc.text(`LLP: ${user.llp}`);
  doc.moveDown();

  // Client info
  doc.text(`To: ${invoice.clientId}`); // You may want to populate client details
  doc.moveDown();

  // Invoice details
  doc.text(`Invoice #: ${invoice.invoiceNumber}`);
  doc.text(`Date: ${invoice.createdAt.toDateString()}`);
  doc.text(`Status: ${invoice.status}`);
  doc.moveDown();

  // Table header
  doc.font('Helvetica-Bold').text('Description', 50, doc.y).text('Qty', 250, doc.y).text('Rate', 300, doc.y).text('Amount', 400, doc.y);
  doc.moveDown();
  doc.font('Helvetica');

  // Table rows
  (invoice.lineItems || []).forEach((item: any) => {
    doc.text(item.description, 50, doc.y)
      .text(item.quantity, 250, doc.y)
      .text(item.rate, 300, doc.y)
      .text(item.amount, 400, doc.y);
    doc.moveDown();
  });

  // Total
  doc.moveDown();
  doc.font('Helvetica-Bold').text(`Total: $${invoice.amount}`, 400, doc.y);
}
