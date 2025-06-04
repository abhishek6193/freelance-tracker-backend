import express from 'express';
import timeEntryController from '../controllers/timeEntryController';
import requireAuth from '../middleware/requireAuth';

const router = express.Router();

router.use(requireAuth);

router.get('/', timeEntryController.getTimeEntries);
router.post('/', timeEntryController.createTimeEntry);
router.get('/:id', timeEntryController.getTimeEntry);
router.patch('/:id', timeEntryController.updateTimeEntry);
router.delete('/:id', timeEntryController.deleteTimeEntry);

export default router;
