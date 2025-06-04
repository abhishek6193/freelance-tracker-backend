import { Request, Response } from 'express';
import TimeEntry from '../models/TimeEntry';
import { AuthRequest } from '../middleware/requireAuth';
import { Types } from 'mongoose';

// List time entries with pagination, sorting, filtering
export const getTimeEntries = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const {
    clientId,
    taskId,
    start,
    end,
    isBilled,
    page = 1,
    limit = 20,
    sort = 'startTime',
    order = 'desc',
  } = req.query;
  const query: any = { userId };
  if (clientId) query.clientId = clientId;
  if (taskId) query.taskId = taskId;
  if (isBilled !== undefined) query.isBilled = isBilled === 'true';
  if (start || end) {
    query.startTime = {};
    if (start) query.startTime.$gte = new Date(start as string);
    if (end) query.startTime.$lte = new Date(end as string);
  }
  const skip = (Number(page) - 1) * Number(limit);
  const sortObj: any = { [sort as string]: order === 'asc' ? 1 : -1 };
  const total = await TimeEntry.countDocuments(query);
  const data = await TimeEntry.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(Number(limit));
  res.json({ data, total, page: Number(page), limit: Number(limit) });
};

// Create time entry
export const createTimeEntry = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  try {
    const { clientId, taskId, startTime, endTime, duration, note, isBilled } = req.body;
    const entry = new TimeEntry({
      userId,
      clientId,
      taskId,
      startTime,
      endTime,
      duration,
      note,
      isBilled,
    });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create time entry.' });
  }
};

// Get single time entry
export const getTimeEntry = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const { id } = req.params;
  const entry = await TimeEntry.findOne({ _id: id, userId });
  if (!entry) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  res.json(entry);
};

// Update time entry
export const updateTimeEntry = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const { id } = req.params;
  const entry = await TimeEntry.findOneAndUpdate(
    { _id: id, userId },
    req.body,
    { new: true }
  );
  if (!entry) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  res.json(entry);
};

// Delete time entry
export const deleteTimeEntry = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  const { id } = req.params;
  const entry = await TimeEntry.findOneAndDelete({ _id: id, userId });
  if (!entry) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  res.json({ success: true });
};

export default {
  getTimeEntries,
  createTimeEntry,
  getTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
};
