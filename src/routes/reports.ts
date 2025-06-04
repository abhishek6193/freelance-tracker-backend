import express from 'express';
import * as reportController from '../controllers/reportController';
import requireAuth from '../middleware/requireAuth';

const router = express.Router();

router.use(requireAuth);

router.get('/summary', reportController.getSummary);
router.get('/activity', reportController.getActivity);
router.get('/custom', reportController.getCustom);
// TODO: Add export endpoint

export default router;
