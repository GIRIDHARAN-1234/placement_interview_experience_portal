const InterviewExperience = require('../models/InterviewExperience');
const PlacementOffer = require('../models/PlacementOffer');
const HelpfulVote = require('../models/HelpfulVote');
const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');
const AuditLog = require('../models/AuditLog');

// @desc    Get all APPROVED interview experiences (Public/Students)
// @route   GET /api/experiences
// @access  Public
const getApprovedExperiences = async (req, res, next) => {
  try {
    const { companyId, difficulty, search, page = 1, limit = 10, sort = 'recent' } = req.query;

    // Critical: Only Approved experiences are ever returned here!
    const query = { status: 'Approved' };

    if (companyId) {
      query.companyId = companyId;
    }

    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    if (search) {
      query.$or = [
        { jobRole: { $regex: search, $options: 'i' } },
        { preparationStrategy: { $regex: search, $options: 'i' } },
        { 'rounds.questionsAsked': { $regex: search, $options: 'i' } },
        { 'rounds.topicsCovered': { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    let sortOptions = { createdAt: -1 };
    if (sort === 'helpful') {
      sortOptions = { helpfulCount: -1, createdAt: -1 };
    }

    const total = await InterviewExperience.countDocuments(query);
    const experiences = await InterviewExperience.find(query)
      .populate('companyId', 'name slug logoUrl industry')
      .populate('placementDriveId', 'title driveYear')
      .populate('studentId', 'name department graduationYear isPlacementVerified')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: experiences,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single interview experience by ID
// @route   GET /api/experiences/:id
// @access  Public / Protected (for pending/rejected check)
const getExperienceById = async (req, res, next) => {
  try {
    const experience = await InterviewExperience.findById(req.params.id)
      .populate('companyId', 'name slug logoUrl industry description')
      .populate('placementDriveId', 'title driveYear jobRoles')
      .populate('studentId', 'name department graduationYear isPlacementVerified');

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Interview experience not found.',
      });
    }

    // Privacy & Moderation Guard:
    // If not approved, only the author or an admin is allowed to view it
    if (experience.status !== 'Approved') {
      const isAuthor = req.user && req.user._id.toString() === experience.studentId._id.toString();
      const isAdmin = req.user && req.user.role === 'admin';

      if (!isAuthor && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'This interview experience is pending moderation review and is not publicly accessible.',
        });
      }
    }

    // Check if the requesting user has voted helpful
    let hasVotedHelpful = false;
    if (req.user) {
      const vote = await HelpfulVote.findOne({
        userId: req.user._id,
        experienceId: experience._id,
      });
      hasVotedHelpful = !!vote;
    }

    res.status(200).json({
      success: true,
      data: experience,
      hasVotedHelpful,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit new interview experience (Students)
// @route   POST /api/experiences
// @access  Private (Student)
const createExperience = async (req, res, next) => {
  try {
    const {
      companyId,
      placementDriveId,
      jobRole,
      interviewDate,
      interviewMode,
      rounds,
      difficulty,
      preparationStrategy,
      resourcesRecommended,
      advice,
      selectionOutcome,
    } = req.body;

    const studentId = req.user._id;

    // 1. Verify user's student role
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only registered students can submit interview experiences.',
      });
    }

    // 2. Validate Company existence
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Specified company does not exist in the portal.',
      });
    }

    // 3. Resolve Placement Drive if provided or find matching drive
    let resolvedDriveId = null;
    if (placementDriveId) {
      const drive = await PlacementDrive.findById(placementDriveId);
      if (drive && drive.companyId.toString() === company._id.toString()) {
        resolvedDriveId = drive._id;
      }
    } else {
      // Find latest drive for this company if available
      const latestDrive = await PlacementDrive.findOne({ companyId: company._id }).sort({ driveYear: -1 });
      if (latestDrive) {
        resolvedDriveId = latestDrive._id;
      }
    }

    // 4. Create Interview Experience with status 'Pending Review'
    const newExperience = await InterviewExperience.create({
      studentId,
      companyId,
      placementDriveId: resolvedDriveId,
      jobRole: jobRole ? jobRole.trim() : 'Software Engineer',
      interviewDate: new Date(interviewDate),
      interviewMode: interviewMode || 'on-campus',
      selectionOutcome: selectionOutcome || 'Selected',
      rounds,
      difficulty: difficulty || 'Medium',
      preparationStrategy: preparationStrategy.trim(),
      resourcesRecommended: resourcesRecommended ? resourcesRecommended.trim() : '',
      advice: advice ? advice.trim() : '',
      status: 'Pending Review', // Moderation required
      moderationFeedback: '',
      helpfulCount: 0,
    });

    // Populate for clean response
    const populated = await InterviewExperience.findById(newExperience._id)
      .populate('companyId', 'name slug logoUrl')
      .populate('placementDriveId', 'title driveYear')
      .populate('studentId', 'name registerNumber department isPlacementVerified');

    res.status(201).json({
      success: true,
      message:
        'Your interview experience has been submitted successfully and is currently under administrative moderation review.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle helpful vote for an approved experience
// @route   POST /api/experiences/:id/helpful
// @access  Private (Authenticated User)
const voteHelpful = async (req, res, next) => {
  try {
    const experienceId = req.params.id;
    const userId = req.user._id;

    const experience = await InterviewExperience.findById(experienceId);
    if (!experience) {
      return res.status(404).json({ success: false, message: 'Experience not found.' });
    }

    if (experience.status !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot vote on an experience that is not approved.',
      });
    }

    // Check if user has already voted
    const existingVote = await HelpfulVote.findOne({ userId, experienceId });

    if (existingVote) {
      // Toggle off
      await HelpfulVote.findByIdAndDelete(existingVote._id);
      experience.helpfulCount = Math.max(0, experience.helpfulCount - 1);
      await experience.save();

      return res.status(200).json({
        success: true,
        voted: false,
        helpfulCount: experience.helpfulCount,
        message: 'Helpful vote removed.',
      });
    } else {
      // Toggle on
      await HelpfulVote.create({ userId, experienceId });
      experience.helpfulCount += 1;
      await experience.save();

      return res.status(200).json({
        success: true,
        voted: true,
        helpfulCount: experience.helpfulCount,
        message: 'Marked as helpful.',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get submissions made by the currently logged in student
// @route   GET /api/experiences/my-submissions
// @access  Private (Student)
const getMySubmissions = async (req, res, next) => {
  try {
    const submissions = await InterviewExperience.find({
      studentId: req.user._id,
    })
      .populate('companyId', 'name slug logoUrl industry')
      .populate('placementDriveId', 'title driveYear')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApprovedExperiences,
  getExperienceById,
  createExperience,
  voteHelpful,
  getMySubmissions,
};
