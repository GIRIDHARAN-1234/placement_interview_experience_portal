const PlacementDrive = require('../models/PlacementDrive');

// @desc    Get all placement drives
// @route   GET /api/placement-drives
// @access  Public
const getPlacementDrives = async (req, res, next) => {
  try {
    const { companyId, year, status } = req.query;
    const query = {};

    if (companyId) query.companyId = companyId;
    if (year) query.driveYear = Number(year);
    if (status) query.status = status;

    const drives = await PlacementDrive.find(query)
      .populate('companyId', 'name logoUrl slug industry')
      .sort({ driveYear: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: drives.length,
      data: drives,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single placement drive by ID
// @route   GET /api/placement-drives/:id
// @access  Public
const getPlacementDriveById = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id).populate(
      'companyId',
      'name logoUrl slug industry description skills'
    );

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: 'Placement drive not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: drive,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlacementDrives,
  getPlacementDriveById,
};
