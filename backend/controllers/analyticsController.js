const User = require('../models/User');
const Company = require('../models/Company');
const InterviewExperience = require('../models/InterviewExperience');
const Question = require('../models/Question');
const StudyResource = require('../models/StudyResource');

// @desc    Get real public statistics for landing page
// @route   GET /api/analytics/public-stats
// @access  Public
const getPublicStats = async (req, res, next) => {
  try {
    const [
      studentsCount,
      companiesCount,
      approvedExperiencesCount,
      questionsCount,
      resourcesCount,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Company.countDocuments({ status: 'active' }),
      InterviewExperience.countDocuments({ status: 'Approved' }),
      Question.countDocuments({ status: 'published' }),
      StudyResource.countDocuments({ status: 'published' }),
    ]);

    // Featured companies (up to 12)
    const featuredCompanies = await Company.find({ status: 'active' })
      .select('name slug logoUrl industry jobRoles')
      .limit(12)
      .lean();

    // Recently approved 4 experiences
    const recentApprovedExperiences = await InterviewExperience.find({ status: 'Approved' })
      .populate('companyId', 'name slug logoUrl industry')
      .populate('studentId', 'name department graduationYear')
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    // Popular 4 questions
    const popularQuestions = await Question.find({ status: 'published' })
      .populate('companyId', 'name slug')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    res.status(200).json({
      success: true,
      stats: {
        studentsCount,
        companiesCount,
        approvedExperiencesCount,
        questionsCount,
        resourcesCount,
      },
      featuredCompanies,
      recentApprovedExperiences,
      popularQuestions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed portal analytics and trends (for analytics pages)
// @route   GET /api/analytics/portal-trends
// @access  Public
const getPortalTrends = async (req, res, next) => {
  try {
    // Question category breakdown
    const questionCategoryDistribution = await Question.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    // Difficulty breakdown
    const difficultyDistribution = await Question.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
    ]);

    // Company-wise approved experiences count
    const companyExperienceCounts = await InterviewExperience.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: '$companyId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: 'companies',
          localField: '_id',
          remoteField: '_id',
          as: 'company',
        },
      },
      { $unwind: '$company' },
      {
        $project: {
          name: '$company.name',
          count: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        questionCategories: questionCategoryDistribution.map((i) => ({
          name: i._id,
          count: i.count,
        })),
        difficulty: difficultyDistribution.map((i) => ({
          name: i._id,
          count: i.count,
        })),
        companyExperiences: companyExperienceCounts,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicStats,
  getPortalTrends,
};
