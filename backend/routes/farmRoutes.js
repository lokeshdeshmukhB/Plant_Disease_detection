import express from 'express';
import {
  createFarm,
  getFarms,
  getFarmById,
  updateFarm,
  deleteFarm
} from '../controllers/farmController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected and restricted to farmers
router.use(protect);
router.use(restrictTo('farmer'));

router.route('/')
  .post(createFarm)
  .get(getFarms);

router.route('/:id')
  .get(getFarmById)
  .put(updateFarm)
  .delete(deleteFarm);

export default router;
