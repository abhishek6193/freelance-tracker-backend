import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import * as clientController from '../controllers/clientController';
import asyncHandler from 'express-async-handler';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(clientController.getClients));
router.post('/', asyncHandler(clientController.createClient));
router.get('/:id', asyncHandler(clientController.getClient));
router.patch('/:id', asyncHandler(clientController.updateClient));
router.delete('/:id', asyncHandler(clientController.deleteClient));

export default router;
