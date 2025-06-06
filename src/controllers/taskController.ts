import { Request, Response } from 'express';
import Task from '../models/Task';
import { AuthRequest } from '../middleware/requireAuth';

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  try {
    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    // Sorting
    const sortField = (req.query.sort as string) || 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    const sort: any = { [sortField]: sortOrder };
    // Query
    const query = { userId };
    const total = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    res.json({ data: tasks, total, page, limit });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks.' });
  }
};

// Create a new task
export const createTask = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  try {
    const { clientId, name, description, status, hourlyRate, dueDate } = req.body;
    // If dueDate is missing or null, set to today (local time)
    let finalDueDate = dueDate;
    if (!finalDueDate) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      finalDueDate = now;
    }
    const task = new Task({
      userId,
      clientId,
      name,
      description,
      status,
      hourlyRate,
      dueDate: finalDueDate,
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    console.error('Error in createTask:', err); // Log the error for debugging
    res.status(500).json({ message: 'Failed to create task.' });
  }
};

export const getTask = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  try {
    const task = await Task.findOne({ _id: req.params.id, userId });
    if (!task) {
      res.status(404).json({ message: 'Task not found.' });
      return;
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch task.' });
  }
};

// Update an existing task
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  try {
    const { name, description, status, hourlyRate, dueDate } = req.body;
    // If dueDate is missing or null, set to today (local time)
    let finalDueDate = dueDate;
    if (finalDueDate === undefined || finalDueDate === null) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      finalDueDate = now;
    }
    const update: any = { name, description, status, hourlyRate };
    if (finalDueDate) update.dueDate = finalDueDate;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId },
      update,
      { new: true }
    );
    if (!task) {
      res.status(404).json({ message: 'Task not found.' });
      return;
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task.' });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId });
    if (!task) {
      res.status(404).json({ message: 'Task not found.' });
      return;
    }
    res.json({ message: 'Task deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task.' });
  }
};
