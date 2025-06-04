import express from 'express';
import invoiceController from '../controllers/invoiceController';
import requireAuth from '../middleware/requireAuth';

const router = express.Router();

router.use(requireAuth);

router.get('/', invoiceController.getInvoices);
router.post('/', invoiceController.createInvoice);
router.get('/:id', invoiceController.getInvoice);
router.patch('/:id', invoiceController.updateInvoice);
router.delete('/:id', invoiceController.deleteInvoice);
router.get('/:id/pdf', invoiceController.downloadInvoicePDF);
router.post('/:id/email', invoiceController.emailInvoice);

export default router;
