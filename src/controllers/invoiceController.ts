import { Request, Response } from 'express';
import Invoice from '../models/Invoice';
import User from '../models/User';
import Client from '../models/Client';
import { AuthRequest } from '../middleware/requireAuth';
import { generateInvoicePDF } from '../utils/pdf';
import { sendInvoiceEmail } from '../utils/email';
import { Types } from 'mongoose';

// List invoices with pagination, sorting, filtering
export const getInvoices = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const {
    clientId,
    status,
    start,
    end,
    page = 1,
    limit = 20,
    sort = 'issueDate',
    order = 'desc',
  } = req.query;
  const query: any = { userId };
  if (clientId) query.clientId = clientId;
  if (status) query.status = status;
  if (start || end) {
    query.createdAt = {};
    if (start) query.createdAt.$gte = new Date(start as string);
    if (end) query.createdAt.$lte = new Date(end as string);
  }
  const skip = (Number(page) - 1) * Number(limit);
  const sortObj: any = { [sort as string]: order === 'asc' ? 1 : -1 };
  const total = await Invoice.countDocuments(query);
  const data = await Invoice.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(Number(limit));
  res.json({ data, total, page: Number(page), limit: Number(limit) });
};

// Create invoice
export const createInvoice = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  try {
    const { clientId, timeEntryIds, invoiceNumber, amount, status, pdfUrl, sentAt, paidAt, lineItems } = req.body;
    const invoice = new Invoice({
      userId,
      clientId,
      timeEntryIds,
      invoiceNumber,
      amount,
      status,
      pdfUrl,
      sentAt,
      paidAt,
      lineItems,
    });
    await invoice.save();
    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create invoice.' });
  }
};

// Get single invoice
export const getInvoice = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const { id } = req.params;
  const invoice = await Invoice.findOne({ _id: id, userId });
  if (!invoice) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  res.json(invoice);
};

// Update invoice
export const updateInvoice = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const { id } = req.params;
  const invoice = await Invoice.findOneAndUpdate(
    { _id: id, userId },
    req.body,
    { new: true }
  );
  if (!invoice) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  res.json(invoice);
};

// Delete invoice
export const deleteInvoice = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const { id } = req.params;
  const invoice = await Invoice.findOneAndDelete({ _id: id, userId });
  if (!invoice) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  res.json({ success: true });
};

export const downloadInvoicePDF = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const { id } = req.params;
  const invoice = await Invoice.findOne({ _id: id, userId }).lean();
  if (!invoice) {
    res.status(404).json({ message: 'Invoice not found' });
    return;
  }
  const user = await User.findById(userId).lean();
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  generateInvoicePDF(invoice as any, user, res);
};

export const emailInvoice = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const { id } = req.params;
  const { to } = req.body; // recipient email
  const invoice = await Invoice.findOne({ _id: id, userId }).lean();
  if (!invoice) {
    res.status(404).json({ message: 'Invoice not found' });
    return;
  }
  const user = await User.findById(userId).lean();
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  // Generate PDF as buffer
  const pdfBuffer = await require('../utils/pdf').generateInvoicePDFBuffer(invoice, user);
  const info = await sendInvoiceEmail({
    to,
    subject: `Invoice ${invoice.invoiceNumber}`,
    text: `Please find attached invoice ${invoice.invoiceNumber}.`,
    attachments: [
      {
        filename: `invoice-${invoice.invoiceNumber}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
  res.json({ message: 'Email sent', previewUrl: info.previewUrl });
};

export default {
  getInvoices,
  createInvoice,
  getInvoice,
  updateInvoice,
  deleteInvoice,
  downloadInvoicePDF,
  emailInvoice,
};
