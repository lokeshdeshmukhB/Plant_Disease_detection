import Farm from '../models/Farm.js';

// @desc    Create a new farm
// @route   POST /api/farms
// @access  Private (Farmer only)
export const createFarm = async (req, res) => {
  try {
    const { farmName, location, area, areaUnit, cropType, soilType, irrigationType, description } = req.body;

    const farm = await Farm.create({
      farmerId: req.user.id,
      farmName,
      location,
      area,
      areaUnit,
      cropType,
      soilType,
      irrigationType,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Farm created successfully',
      farm
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating farm',
      error: error.message
    });
  }
};

// @desc    Get all farms for logged in farmer
// @route   GET /api/farms
// @access  Private (Farmer only)
export const getFarms = async (req, res) => {
  try {
    const farms = await Farm.find({ farmerId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: farms.length,
      farms
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching farms',
      error: error.message
    });
  }
};

// @desc    Get single farm by ID
// @route   GET /api/farms/:id
// @access  Private (Farmer only)
export const getFarmById = async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    // Make sure user owns the farm
    if (farm.farmerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this farm'
      });
    }

    res.status(200).json({
      success: true,
      farm
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching farm',
      error: error.message
    });
  }
};

// @desc    Update farm
// @route   PUT /api/farms/:id
// @access  Private (Farmer only)
export const updateFarm = async (req, res) => {
  try {
    let farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    // Make sure user owns the farm
    if (farm.farmerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this farm'
      });
    }

    farm = await Farm.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Farm updated successfully',
      farm
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating farm',
      error: error.message
    });
  }
};

// @desc    Delete farm
// @route   DELETE /api/farms/:id
// @access  Private (Farmer only)
export const deleteFarm = async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    // Make sure user owns the farm
    if (farm.farmerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this farm'
      });
    }

    await farm.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Farm deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting farm',
      error: error.message
    });
  }
};
