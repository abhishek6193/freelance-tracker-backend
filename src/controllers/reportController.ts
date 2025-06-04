import { Request, Response } from 'express';
import TimeEntry from '../models/TimeEntry';
import Invoice from '../models/Invoice';
import Task from '../models/Task';

// Dashboard summary: time tracked, unbilled hours, invoice stats
export const getSummary = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { clientId, start, end } = req.query;
  const timeQuery: any = { userId };
  if (clientId) timeQuery.clientId = clientId;
  if (start || end) {
    timeQuery.startTime = {};
    if (start) timeQuery.startTime.$gte = new Date(start as string);
    if (end) timeQuery.startTime.$lte = new Date(end as string);
  }
  // Total time tracked
  const totalTime = await TimeEntry.aggregate([
    { $match: timeQuery },
    { $group: { _id: null, total: { $sum: "$duration" } } }
  ]);
  // Unbilled hours
  const unbilledTime = await TimeEntry.aggregate([
    { $match: { ...timeQuery, isBilled: false } },
    { $group: { _id: null, total: { $sum: "$duration" } } }
  ]);
  // Invoice stats
  const invoiceQuery: any = { userId };
  if (clientId) invoiceQuery.clientId = clientId;
  if (start || end) {
    invoiceQuery.createdAt = {};
    if (start) invoiceQuery.createdAt.$gte = new Date(start as string);
    if (end) invoiceQuery.createdAt.$lte = new Date(end as string);
  }
  const invoices = await Invoice.find(invoiceQuery);
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const paid = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const unpaid = invoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + (inv.amount || 0), 0);
  res.json({
    totalTime: totalTime[0]?.total || 0,
    unbilledTime: unbilledTime[0]?.total || 0,
    totalInvoiced,
    paid,
    unpaid,
  });
};

// Recent activity feed (time entries, invoices, tasks)
export const getActivity = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  // Fetch recent time entries, invoices, and tasks (last 10 each)
  const [timeEntries, invoices, tasks] = await Promise.all([
    TimeEntry.find({ userId }).sort({ createdAt: -1 }).limit(10),
    Invoice.find({ userId }).sort({ createdAt: -1 }).limit(10),
    Task.find({ userId }).sort({ createdAt: -1 }).limit(10),
  ]);
  res.json({ timeEntries, invoices, tasks });
};

// Custom dashboard card data (user-defined filters/aggregations)
export const getCustom = async (req: Request, res: Response) => {
  // For MVP, just return empty; expand as needed
  res.json({});
};
