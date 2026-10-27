const Bookmark = require('../models/Bookmark');
const Question = require('../models/Question');
const InterviewExperience = require('../models/InterviewExperience');
const StudyResource = require('../models/StudyResource');
const Company = require('../models/Company');

// @desc    Get all bookmarks for logged-in user with populated items
// @route   GET /api/bookmarks
// @access  Private
const getBookmarks = async (req, res, next) => {
  try {
    const { itemType } = req.query;
    const query = { userId: req.user._id };

    if (itemType) {
      query.itemType = itemType;
    }

    const bookmarks = await Bookmark.find(query).sort({ createdAt: -1 }).lean();

    // Group items by type to batch populate
    const questionIds = bookmarks.filter((b) => b.itemType === 'question').map((b) => b.itemId);
    const experienceIds = bookmarks.filter((b) => b.itemType === 'experience').map((b) => b.itemId);
    const resourceIds = bookmarks.filter((b) => b.itemType === 'resource').map((b) => b.itemId);
    const companyIds = bookmarks.filter((b) => b.itemType === 'company').map((b) => b.itemId);

    const [questions, experiences, resources, companies] = await Promise.all([
      Question.find({ _id: { $in: questionIds } }).populate('companyId', 'name logoUrl'),
      InterviewExperience.find({ _id: { $in: experienceIds } })
        .populate('companyId', 'name logoUrl')
        .populate('studentId', 'name department'),
      StudyResource.find({ _id: { $in: resourceIds } }).populate('companyId', 'name logoUrl'),
      Company.find({ _id: { $in: companyIds } }),
    ]);

    const itemMaps = {
      question: new Map(questions.map((q) => [q._id.toString(), q])),
      experience: new Map(experiences.map((e) => [e._id.toString(), e])),
      resource: new Map(resources.map((r) => [r._id.toString(), r])),
      company: new Map(companies.map((c) => [c._id.toString(), c])),
    };

    const populatedBookmarks = bookmarks
      .map((b) => {
        const item = itemMaps[b.itemType]?.get(b.itemId.toString());
        return {
          ...b,
          item: item || null,
        };
      })
      .filter((b) => b.item !== null); // Filter out any items that may have been deleted

    res.status(200).json({
      success: true,
      count: populatedBookmarks.length,
      data: populatedBookmarks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle bookmark for an item
// @route   POST /api/bookmarks/toggle
// @access  Private
const toggleBookmark = async (req, res, next) => {
  try {
    const { itemType, itemId } = req.body;

    if (!['question', 'experience', 'resource', 'company'].includes(itemType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid itemType. Must be question, experience, resource, or company.',
      });
    }

    const existing = await Bookmark.findOne({
      userId: req.user._id,
      itemType,
      itemId,
    });

    if (existing) {
      await Bookmark.findByIdAndDelete(existing._id);
      return res.status(200).json({
        success: true,
        bookmarked: false,
        message: 'Item removed from your bookmarks.',
      });
    } else {
      await Bookmark.create({
        userId: req.user._id,
        itemType,
        itemId,
      });
      return res.status(201).json({
        success: true,
        bookmarked: true,
        message: 'Item saved to your bookmarks.',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Check if an item is bookmarked by logged in user
// @route   GET /api/bookmarks/check
// @access  Private
const checkBookmarkStatus = async (req, res, next) => {
  try {
    const { itemType, itemId } = req.query;
    if (!itemType || !itemId) {
      return res.status(400).json({ success: false, message: 'itemType and itemId required' });
    }

    const bookmark = await Bookmark.findOne({
      userId: req.user._id,
      itemType,
      itemId,
    });

    res.status(200).json({
      success: true,
      bookmarked: !!bookmark,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBookmarks,
  toggleBookmark,
  checkBookmarkStatus,
};
