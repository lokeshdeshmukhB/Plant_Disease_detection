import Prediction from '../models/Prediction.js';
import axios from 'axios';
import path from 'path';

// @desc    Upload images and predict disease
// @route   POST /api/predictions/predict
// @access  Private (Farmer only)
export const predictDisease = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one image'
      });
    }

    const { farmId, notes } = req.body;

    // Prepare images data
    const images = req.files.map(file => ({
      filename: file.filename,
      path: file.path,
      uploadedAt: new Date()
    }));

    // Call Python ML service for prediction
    let predictions = [];
    
    try {
      // Send images to ML service
      const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/predict`, {
        images: req.files.map(file => ({
          filename: file.filename,
          path: file.path
        }))
      }, {
        timeout: 30000 // 30 seconds timeout
      });

      predictions = mlResponse.data.predictions;
    } catch (mlError) {
      console.error('ML Service Error:', mlError.message);
      
      // If ML service is not available, create a placeholder prediction
      // This allows the system to work even when ML service is down
      predictions = req.files.map((file, index) => ({
        imageIndex: index,
        predictedClass: 'ML_SERVICE_UNAVAILABLE',
        confidence: 0,
        allPredictions: []
      }));
    }

    // Create prediction record
    const prediction = await Prediction.create({
      farmerId: req.user.id,
      farmId: farmId || null,
      images,
      predictions,
      notes
    });

    // Populate farmer and farm details
    await prediction.populate('farmerId', 'name email');
    if (farmId) {
      await prediction.populate('farmId', 'farmName location');
    }

    res.status(201).json({
      success: true,
      message: 'Prediction completed successfully',
      prediction
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error during prediction',
      error: error.message
    });
  }
};

// @desc    Get all predictions for logged in farmer
// @route   GET /api/predictions
// @access  Private (Farmer only)
export const getPredictions = async (req, res) => {
  try {
    const predictions = await Prediction.find({ farmerId: req.user.id })
      .populate('farmId', 'farmName location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: predictions.length,
      predictions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching predictions',
      error: error.message
    });
  }
};

// @desc    Get single prediction by ID
// @route   GET /api/predictions/:id
// @access  Private (Farmer only)
export const getPredictionById = async (req, res) => {
  try {
    const prediction = await Prediction.findById(req.params.id)
      .populate('farmerId', 'name email')
      .populate('farmId', 'farmName location');

    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: 'Prediction not found'
      });
    }

    // Make sure user owns the prediction
    if (prediction.farmerId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this prediction'
      });
    }

    res.status(200).json({
      success: true,
      prediction
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching prediction',
      error: error.message
    });
  }
};

// @desc    Delete prediction
// @route   DELETE /api/predictions/:id
// @access  Private (Farmer only)
export const deletePrediction = async (req, res) => {
  try {
    const prediction = await Prediction.findById(req.params.id);

    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: 'Prediction not found'
      });
    }

    // Make sure user owns the prediction
    if (prediction.farmerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this prediction'
      });
    }

    await prediction.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Prediction deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting prediction',
      error: error.message
    });
  }
};
