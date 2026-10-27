const Question = require('../models/Question');
const Company = require('../models/Company');

// @desc    Get questions with search, category, difficulty, company, and pagination
// @route   GET /api/questions
// @access  Public
const getQuestions = async (req, res, next) => {
  try {
    const {
      search,
      category,
      difficulty,
      companyId,
      sourceType,
      page = 1,
      limit = 15,
    } = req.query;

    const query = { status: 'published' };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    if (companyId && companyId !== 'All') {
      query.companyId = companyId;
    }

    if (sourceType && sourceType !== 'All') {
      query.sourceType = sourceType;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { questionText: { $regex: search, $options: 'i' } },
        { topicTags: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await Question.countDocuments(query);
    const questions = await Question.find(query)
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
      data: questions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single question by ID
// @route   GET /api/questions/:id
// @access  Public
const getQuestionById = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id).populate(
      'companyId',
      'name slug logoUrl industry'
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get distinct question categories with counts
// @route   GET /api/questions/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Question.aggregate([
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

// @desc    Generate a Smart Practice session
// @route   POST /api/questions/smart-practice
// @access  Private (Authenticated)
const getSmartPracticeSession = async (req, res, next) => {
  try {
    const { category, companyId, difficulty, count = 10, timeLimitMinutes = 20 } = req.body;

    const query = { status: 'published' };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (companyId && companyId !== 'All') {
      query.companyId = companyId;
    }

    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    const questionLimit = Math.min(30, Math.max(3, parseInt(count, 10)));

    let questions = await Question.find(query)
      .populate('companyId', 'name slug logoUrl')
      .lean();

    if (!questions || questions.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          'No practice questions found matching your selected criteria. Try selecting "All" for category or difficulty.',
      });
    }

    // Shuffle and limit
    questions = questions.sort(() => 0.5 - Math.random()).slice(0, questionLimit);

    res.status(200).json({
      success: true,
      sessionMeta: {
        totalQuestions: questions.length,
        timeLimitMinutes: Number(timeLimitMinutes) || 20,
        filters: { category, companyId, difficulty },
      },
      questions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuestions,
  getQuestionById,
  getCategories,
  getSmartPracticeSession,
};
