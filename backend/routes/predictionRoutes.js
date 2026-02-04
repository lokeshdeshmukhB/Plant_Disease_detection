import express from 'express';
import {
  predictDisease,
  getPredictions,
  getPredictionById,
  deletePrediction
} from '../controllers/predictionController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All routes are protected and restricted to farmers
router.use(protect);
router.use(restrictTo('farmer'));

router.post('/predict', upload.array('images', 10), predictDisease);
router.get('/', getPredictions);
router.route('/:id')
  .get(getPredictionById)
  .delete(deletePrediction);

export default router;
