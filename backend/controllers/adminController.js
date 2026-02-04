import User from '../models/User.js';
import Farm from '../models/Farm.js';
import Prediction from '../models/Prediction.js';

// @desc    Get all farmers
// @route   GET /api/admin/farmers
// @access  Private (Admin only)
export const getAllFarmers = async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: farmers.length,
      farmers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching farmers',
      error: error.message
    });
  }
};

// @desc    Get farmer by ID with details
// @route   GET /api/admin/farmers/:id
// @access  Private (Admin only)
export const getFarmerById = async (req, res) => {
  try {
    const farmer = await User.findById(req.params.id).select('-password');

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    if (farmer.role !== 'farmer') {
      return res.status(400).json({
        success: false,
        message: 'User is not a farmer'
      });
    }

    // Get farmer's farms
    const farms = await Farm.find({ farmerId: req.params.id });

    // Get farmer's predictions
    const predictions = await Prediction.find({ farmerId: req.params.id })
      .populate('farmId', 'farmName location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      farmer,
      farms,
      predictions,
      stats: {
        totalFarms: farms.length,
        totalPredictions: predictions.length,
        healthyPredictions: predictions.filter(p => p.overallStatus === 'healthy').length,
        diseasedPredictions: predictions.filter(p => p.overallStatus === 'diseased').length
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching farmer details',
      error: error.message
    });
  }
};

// @desc    Get overall statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
export const getStats = async (req, res) => {
  try {
    // Count total farmers
    const totalFarmers = await User.countDocuments({ role: 'farmer' });

    // Count total farms
    const totalFarms = await Farm.countDocuments();

    // Count total predictions
    const totalPredictions = await Prediction.countDocuments();

    // Get recent farmers (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentFarmers = await User.countDocuments({
      role: 'farmer',
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get prediction statistics
    const healthyPredictions = await Prediction.countDocuments({ overallStatus: 'healthy' });
    const diseasedPredictions = await Prediction.countDocuments({ overallStatus: 'diseased' });
    const mixedPredictions = await Prediction.countDocuments({ overallStatus: 'mixed' });

    // Get recent predictions (last 10)
    const recentPredictions = await Prediction.find()
      .populate('farmerId', 'name email')
      .populate('farmId', 'farmName')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get top farmers by prediction count
    const topFarmers = await Prediction.aggregate([
      {
        $group: {
          _id: '$farmerId',
          predictionCount: { $sum: 1 }
        }
      },
      { $sort: { predictionCount: -1 } },
      { $limit: 5 }
    ]);

    // Populate farmer details for top farmers
    const topFarmersWithDetails = await User.populate(topFarmers, {
      path: '_id',
      select: 'name email'
    });

    res.status(200).json({
      success: true,
      stats: {
        totalFarmers,
        totalFarms,
        totalPredictions,
        recentFarmers,
        predictionStats: {
          healthy: healthyPredictions,
          diseased: diseasedPredictions,
          mixed: mixedPredictions
        }
      },
      recentPredictions,
      topFarmers: topFarmersWithDetails
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics',
      error: error.message
    });
  }
};

// @desc    Get farmer's predictions
// @route   GET /api/admin/farmers/:id/predictions
// @access  Private (Admin only)
export const getFarmerPredictions = async (req, res) => {
  try {
    const predictions = await Prediction.find({ farmerId: req.params.id })
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
