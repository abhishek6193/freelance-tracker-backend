import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { createTask, updateTask, getTasks, getTask, deleteTask } from '../controllers/taskController';
import asyncHandler from 'express-async-handler';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(getTasks));
router.post('/', requireAuth, createTask);
router.get('/:id', asyncHandler(getTask));
router.patch('/:id', requireAuth, updateTask);
router.delete('/:id', asyncHandler(deleteTask));

export default router;
