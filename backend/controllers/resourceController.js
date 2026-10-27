const StudyResource = require('../models/StudyResource');

// @desc    Get all study resources with filters and pagination
// @route   GET /api/resources
// @access  Public
const getResources = async (req, res, next) => {
  try {
    const { category, companyId, resourceType, search, page = 1, limit = 12 } = req.query;

    const query = { status: 'published' };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (companyId && companyId !== 'All') {
      query.companyId = companyId;
    }

    if (resourceType && resourceType !== 'All') {
      query.resourceType = resourceType;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { topicTags: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await StudyResource.countDocuments(query);
    const resources = await StudyResource.find(query)
      .populate('companyId', 'name slug logoUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: resources,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single study resource by ID
// @route   GET /api/resources/:id
// @access  Public
const getResourceById = async (req, res, next) => {
  try {
    const resource = await StudyResource.findById(req.params.id).populate(
      'companyId',
      'name slug logoUrl industry'
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Study resource not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get study resource categories with counts
// @route   GET /api/resources/categories
// @access  Public
const getResourceCategories = async (req, res, next) => {
  try {
    const categories = await StudyResource.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: categories.map((c) => ({ category: c._id, count: c.count })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResources,
  getResourceById,
  getResourceCategories,
};
