import express from 'express';
import {
  getAllFarmers,
  getFarmerById,
  getStats,
  getFarmerPredictions
} from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected and restricted to admins
router.use(protect);
router.use(restrictTo('admin'));

router.get('/farmers', getAllFarmers);
router.get('/farmers/:id', getFarmerById);
router.get('/stats', getStats);
router.get('/farmers/:id/predictions', getFarmerPredictions);

export default router;
