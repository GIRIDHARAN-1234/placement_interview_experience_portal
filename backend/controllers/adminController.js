const User = require('../models/User');
const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');
const PlacementOffer = require('../models/PlacementOffer');
const InterviewExperience = require('../models/InterviewExperience');
const Question = require('../models/Question');
const StudyResource = require('../models/StudyResource');
const AuditLog = require('../models/AuditLog');

// @desc    Get system-wide dashboard metrics (Admin only)
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboardMetrics = async (req, res, next) => {
  try {
    const [
      studentsCount,
      companiesCount,
      activeDrivesCount,
      verifiedOffersCount,
      pendingExpCount,
      approvedExpCount,
      rejectedExpCount,
      questionsCount,
      resourcesCount,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Company.countDocuments({ status: 'active' }),
      PlacementDrive.countDocuments({ status: { $in: ['ongoing', 'upcoming'] } }),
      PlacementOffer.countDocuments({ status: 'selected' }),
      InterviewExperience.countDocuments({ status: 'Pending Review' }),
      InterviewExperience.countDocuments({ status: 'Approved' }),
      InterviewExperience.countDocuments({ status: 'Rejected' }),
      Question.countDocuments({ status: 'published' }),
      StudyResource.countDocuments({ status: 'published' }),
    ]);

    // Recent 5 pending submissions
    const recentPendingSubmissions = await InterviewExperience.find({ status: 'Pending Review' })
      .populate('companyId', 'name logoUrl')
      .populate('studentId', 'name registerNumber department')
      .populate('placementDriveId', 'title driveYear')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent 10 audit logs
    const recentAuditLogs = await AuditLog.find().sort({ timestamp: -1 }).limit(10);

    res.status(200).json({
      success: true,
      metrics: {
        studentsCount,
        companiesCount,
        activeDrivesCount,
        verifiedOffersCount,
        pendingExpCount,
        approvedExpCount,
        rejectedExpCount,
        questionsCount,
        resourcesCount,
      },
      recentPendingSubmissions,
      recentAuditLogs,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== STUDENT MANAGEMENT ====================

// @desc    Get registered students list with search and pagination
// @route   GET /api/admin/students
// @access  Private (Admin)
const getStudents = async (req, res, next) => {
  try {
    const { search, department, graduationYear, status, verificationStatus, page = 1, limit = 20 } = req.query;

    const query = { role: 'student' };

    if (department && department !== 'All') query.department = department;
    if (graduationYear && graduationYear !== 'All') query.graduationYear = Number(graduationYear);
    if (status && status !== 'All') query.accountStatus = status;
    if (verificationStatus === 'verified') query.isPlacementVerified = true;
    if (verificationStatus === 'unverified') query.isPlacementVerified = { $ne: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { registerNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const students = await User.find(query)
      .select('-passwordHash')
      .populate('verifiedCompanies', 'name logoUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle student active/inactive status
// @route   PUT /api/admin/students/:id/status
// @access  Private (Admin)
const toggleStudentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const student = await User.findById(req.params.id);

    if (!student || student.role === 'admin') {
      return res.status(404).json({ success: false, message: 'Student account not found.' });
    }

    const prevStatus = student.accountStatus;
    student.accountStatus = status || (prevStatus === 'active' ? 'inactive' : 'active');
    await student.save();

    await AuditLog.create({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'STUDENT_STATUS_TOGGLED',
      entityType: 'User',
      entityId: student._id,
      safeMetadata: {
        registerNumber: student.registerNumber,
        previousStatus: prevStatus,
        newStatus: student.accountStatus,
      },
    });

    res.status(200).json({
      success: true,
      message: `Student account status updated to ${student.accountStatus}.`,
      data: student.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle student placement verification badge (Admin)
// @route   PUT /api/admin/students/:id/verify
// @access  Private (Admin)
const toggleStudentVerification = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student || student.role === 'admin') {
      return res.status(404).json({ success: false, message: 'Student account not found.' });
    }

    student.isPlacementVerified = !student.isPlacementVerified;
    await student.save();

    await AuditLog.create({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: student.isPlacementVerified ? 'STUDENT_VERIFIED' : 'STUDENT_UNVERIFIED',
      entityType: 'User',
      entityId: student._id,
      safeMetadata: {
        registerNumber: student.registerNumber,
        isPlacementVerified: student.isPlacementVerified,
      },
    });

    res.status(200).json({
      success: true,
      message: `Student placement status set to ${student.isPlacementVerified ? 'Verified' : 'Unverified'}.`,
      data: student.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// ==================== COMPANY MANAGEMENT ====================

// @desc    Create new company
// @route   POST /api/admin/companies
// @access  Private (Admin)
const createCompany = async (req, res, next) => {
  try {
    const { name, description, logoUrl, industry, jobRoles, skills, website } = req.body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existing = await Company.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A company with this name already exists.' });
    }

    const company = await Company.create({
      name: name.trim(),
      slug,
      description: description.trim(),
      logoUrl: logoUrl || '',
      industry: industry.trim(),
      jobRoles: Array.isArray(jobRoles) ? jobRoles : [jobRoles],
      skills: Array.isArray(skills) ? skills : [skills],
      website: website || '',
      status: 'active',
    });

    await AuditLog.create({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'COMPANY_CREATED',
      entityType: 'Company',
      entityId: company._id,
      safeMetadata: { companyName: company.name },
    });

    res.status(201).json({
      success: true,
      message: 'Company created successfully.',
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update company
// @route   PUT /api/admin/companies/:id
// @access  Private (Admin)
const updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    const { name, description, logoUrl, industry, jobRoles, skills, website, status } = req.body;

    if (name) company.name = name.trim();
    if (description) company.description = description.trim();
    if (logoUrl !== undefined) company.logoUrl = logoUrl;
    if (industry) company.industry = industry.trim();
    if (jobRoles) company.jobRoles = Array.isArray(jobRoles) ? jobRoles : [jobRoles];
    if (skills) company.skills = Array.isArray(skills) ? skills : [skills];
    if (website !== undefined) company.website = website;
    if (status) company.status = status;

    await company.save();

    await AuditLog.create({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'COMPANY_UPDATED',
      entityType: 'Company',
      entityId: company._id,
      safeMetadata: { companyName: company.name },
    });

    res.status(200).json({
      success: true,
      message: 'Company updated successfully.',
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== PLACEMENT DRIVE MANAGEMENT ====================

// @desc    Create placement drive
// @route   POST /api/admin/placement-drives
// @access  Private (Admin)
const createPlacementDrive = async (req, res, next) => {
  try {
    const {
      companyId,
      title,
      driveYear,
      jobRoles,
      eligibleDepartments,
      graduationYears,
      driveDates,
      status,
    } = req.body;

    const drive = await PlacementDrive.create({
      companyId,
      title: title.trim(),
      driveYear: Number(driveYear),
      jobRoles: Array.isArray(jobRoles) ? jobRoles : [jobRoles],
      eligibleDepartments: Array.isArray(eligibleDepartments) ? eligibleDepartments : [eligibleDepartments],
      graduationYears: Array.isArray(graduationYears) ? graduationYears : [graduationYears],
      driveDates,
      status: status || 'ongoing',
      createdBy: req.user._id,
    });

    await AuditLog.create({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'DRIVE_CREATED',
      entityType: 'PlacementDrive',
      entityId: drive._id,
      safeMetadata: { driveTitle: drive.title, driveYear: drive.driveYear },
    });

    res.status(201).json({
      success: true,
      message: 'Placement drive created successfully.',
      data: drive,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update placement drive
// @route   PUT /api/admin/placement-drives/:id
// @access  Private (Admin)
const updatePlacementDrive = async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Placement drive not found.' });
    }

    const { title, driveYear, jobRoles, eligibleDepartments, graduationYears, driveDates, status } = req.body;

    if (title) drive.title = title.trim();
    if (driveYear) drive.driveYear = Number(driveYear);
    if (jobRoles) drive.jobRoles = Array.isArray(jobRoles) ? jobRoles : [jobRoles];
    if (eligibleDepartments) drive.eligibleDepartments = Array.isArray(eligibleDepartments) ? eligibleDepartments : [eligibleDepartments];
    if (graduationYears) drive.graduationYears = Array.isArray(graduationYears) ? graduationYears : [graduationYears];
    if (driveDates) drive.driveDates = driveDates;
    if (status) drive.status = status;

    await drive.save();

    res.status(200).json({
      success: true,
      message: 'Placement drive updated successfully.',
      data: drive,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== EXPERIENCE MODERATION ====================

// @desc    Get experiences for moderation (Pending, Approved, Rejected)
// @route   GET /api/admin/experiences
// @access  Private (Admin)
const getModerationList = async (req, res, next) => {
  try {
    const { status = 'Pending Review', companyId, page = 1, limit = 15 } = req.query;

    const query = {};
    if (status && status !== 'All') {
      query.status = status;
    }
    if (companyId) {
      query.companyId = companyId;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await InterviewExperience.countDocuments(query);
    const experiences = await InterviewExperience.find(query)
      .populate('companyId', 'name slug logoUrl')
      .populate('studentId', 'name email registerNumber department graduationYear isPlacementVerified')
      .populate('placementDriveId', 'title driveYear')
      .populate('moderatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

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

// @desc    Moderate an interview experience (Approve or Reject with feedback)
// @route   PUT /api/admin/experiences/:id/moderate
// @access  Private (Admin)
const moderateExperience = async (req, res, next) => {
  try {
    const { status, moderationFeedback } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Moderation status must be either Approved or Rejected.',
      });
    }

    const experience = await InterviewExperience.findById(req.params.id)
      .populate('companyId', 'name')
      .populate('studentId', 'name registerNumber isPlacementVerified');

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Interview experience not found.',
      });
    }

    const prevStatus = experience.status;
    experience.status = status;
    experience.moderationFeedback = moderationFeedback ? moderationFeedback.trim() : '';
    experience.moderatedBy = req.user._id;
    experience.moderatedAt = new Date();

    await experience.save();

    // If Approved and student was selected, mark student with Placement Verification Badge!
    if (status === 'Approved' && experience.selectionOutcome === 'Selected') {
      const studentId = experience.studentId?._id || experience.studentId;
      const compId = experience.companyId?._id || experience.companyId;

      await User.findByIdAndUpdate(studentId, {
        $set: { isPlacementVerified: true },
        $addToSet: { verifiedCompanies: compId },
      });

      // Synchronize placement offer record if drive is present
      if (experience.placementDriveId) {
        await PlacementOffer.findOneAndUpdate(
          {
            studentId,
            companyId: compId,
            placementDriveId: experience.placementDriveId,
          },
          {
            status: 'selected',
            jobRole: experience.jobRole,
            notes: 'Verified via interview experience approval',
          },
          { upsert: true, new: true }
        );
      }
    }

    // Log administrative action
    await AuditLog.create({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: status === 'Approved' ? 'EXPERIENCE_APPROVED' : 'EXPERIENCE_REJECTED',
      entityType: 'InterviewExperience',
      entityId: experience._id,
      safeMetadata: {
        previousStatus: prevStatus,
        newStatus: status,
        companyName: experience.companyId?.name,
        authorRegisterNumber: experience.studentId?.registerNumber,
        moderationFeedback: experience.moderationFeedback,
      },
    });

    res.status(200).json({
      success: true,
      message: `Interview experience has been ${status.toLowerCase()} successfully.`,
      data: experience,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== QUESTION BANK MANAGEMENT ====================

// @desc    Create question (Admin)
// @route   POST /api/admin/questions
// @access  Private (Admin)
const createQuestion = async (req, res, next) => {
  try {
    const {
      title,
      questionText,
      category,
      difficulty,
      companyId,
      topicTags,
      answer,
      explanation,
      codeSnippet,
      sourceType,
      status,
    } = req.body;

    const question = await Question.create({
      title: title.trim(),
      questionText: questionText.trim(),
      category: category.trim(),
      difficulty: difficulty || 'Medium',
      companyId: companyId || null,
      topicTags: Array.isArray(topicTags) ? topicTags : [],
      answer: answer || '',
      explanation: explanation || '',
      codeSnippet: codeSnippet || '',
      sourceType: sourceType || 'Curated Practice',
      status: status || 'published',
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Question created successfully.',
      data: question,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update question (Admin)
// @route   PUT /api/admin/questions/:id
// @access  Private (Admin)
const updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    const {
      title,
      questionText,
      category,
      difficulty,
      companyId,
      topicTags,
      answer,
      explanation,
      codeSnippet,
      sourceType,
      status,
    } = req.body;

    if (title) question.title = title.trim();
    if (questionText) question.questionText = questionText.trim();
    if (category) question.category = category.trim();
    if (difficulty) question.difficulty = difficulty;
    if (companyId !== undefined) question.companyId = companyId || null;
    if (topicTags) question.topicTags = Array.isArray(topicTags) ? topicTags : [];
    if (answer !== undefined) question.answer = answer;
    if (explanation !== undefined) question.explanation = explanation;
    if (codeSnippet !== undefined) question.codeSnippet = codeSnippet;
    if (sourceType) question.sourceType = sourceType;
    if (status) question.status = status;

    await question.save();

    res.status(200).json({
      success: true,
      message: 'Question updated successfully.',
      data: question,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete question (Admin)
// @route   DELETE /api/admin/questions/:id
// @access  Private (Admin)
const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ==================== STUDY RESOURCE MANAGEMENT ====================

// @desc    Create resource (Admin)
// @route   POST /api/admin/resources
// @access  Private (Admin)
const createResource = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      companyId,
      topicTags,
      resourceType,
      resourceUrl,
      fileReference,
      status,
    } = req.body;

    const resource = await StudyResource.create({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      companyId: companyId || null,
      topicTags: Array.isArray(topicTags) ? topicTags : [],
      resourceType: resourceType || 'link',
      resourceUrl: resourceUrl || '',
      fileReference: fileReference || '',
      status: status || 'published',
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Study resource created successfully.',
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update resource (Admin)
// @route   PUT /api/admin/resources/:id
// @access  Private (Admin)
const updateResource = async (req, res, next) => {
  try {
    const resource = await StudyResource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Study resource not found.' });
    }

    const {
      title,
      description,
      category,
      companyId,
      topicTags,
      resourceType,
      resourceUrl,
      fileReference,
      status,
    } = req.body;

    if (title) resource.title = title.trim();
    if (description) resource.description = description.trim();
    if (category) resource.category = category.trim();
    if (companyId !== undefined) resource.companyId = companyId || null;
    if (topicTags) resource.topicTags = Array.isArray(topicTags) ? topicTags : [];
    if (resourceType) resource.resourceType = resourceType;
    if (resourceUrl !== undefined) resource.resourceUrl = resourceUrl;
    if (fileReference !== undefined) resource.fileReference = fileReference;
    if (status) resource.status = status;

    await resource.save();

    res.status(200).json({
      success: true,
      message: 'Study resource updated successfully.',
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resource (Admin)
// @route   DELETE /api/admin/resources/:id
// @access  Private (Admin)
const deleteResource = async (req, res, next) => {
  try {
    const resource = await StudyResource.findByIdAndDelete(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Study resource not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Study resource deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ==================== AUDIT LOG VIEWER ====================

// @desc    Get audit logs with pagination and filters
// @route   GET /api/admin/audit-logs
// @access  Private (Admin)
const getAuditLogs = async (req, res, next) => {
  try {
    const { action, entityType, page = 1, limit = 25 } = req.query;

    const query = {};
    if (action && action !== 'All') query.action = action;
    if (entityType && entityType !== 'All') query.entityType = entityType;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('actorId', 'name email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardMetrics,
  getStudents,
  toggleStudentStatus,
  toggleStudentVerification,
  createCompany,
  updateCompany,
  createPlacementDrive,
  updatePlacementDrive,
  getModerationList,
  moderateExperience,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  createResource,
  updateResource,
  deleteResource,
  getAuditLogs,
};
