import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/requireAuth';
import Client from '../models/Client';

export const getClients = async (req: Request, res: Response): Promise<void> => {
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
    const total = await Client.countDocuments(query);
    const clients = await Client.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    res.json({ data: clients, total, page, limit });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch clients.' });
  }
};

export const createClient = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  try {
    const { name, contactEmail, contactPhone, notes } = req.body;
    const client = new Client({
      userId,
      name,
      contactEmail,
      contactPhone,
      notes,
    });
    await client.save();
    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create client.' });
  }
};

export const getClient = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  try {
    const client = await Client.findOne({ _id: req.params.id, userId });
    if (!client) {
      res.status(404).json({ message: 'Client not found.' });
      return;
    }
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch client.' });
  }
};

export const updateClient = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, userId },
      req.body,
      { new: true }
    );
    if (!client) {
      res.status(404).json({ message: 'Client not found.' });
      return;
    }
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update client.' });
  }
};

export const deleteClient = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthRequest).userId;
  try {
    const client = await Client.findOneAndDelete({ _id: req.params.id, userId });
    if (!client) {
      res.status(404).json({ message: 'Client not found.' });
      return;
    }
    res.json({ message: 'Client deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete client.' });
  }
};
