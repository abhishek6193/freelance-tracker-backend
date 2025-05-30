import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import * as taskController from '../controllers/taskController';
import asyncHandler from 'express-async-handler';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(taskController.getTasks));
router.post('/', asyncHandler(taskController.createTask));
router.get('/:id', asyncHandler(taskController.getTask));
router.patch('/:id', asyncHandler(taskController.updateTask));
router.delete('/:id', asyncHandler(taskController.deleteTask));

export default router;
