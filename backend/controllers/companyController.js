const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');
const InterviewExperience = require('../models/InterviewExperience');
const Question = require('../models/Question');
const StudyResource = require('../models/StudyResource');

// @desc    Get all companies with filters, search and pagination
// @route   GET /api/companies
// @access  Public
const getCompanies = async (req, res, next) => {
  try {
    const { search, industry, page = 1, limit = 12 } = req.query;

    const query = { status: 'active' };

    if (industry && industry !== 'All') {
      query.industry = industry;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { jobRoles: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await Company.countDocuments(query);
    const companies = await Company.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Enhance each company with approved experience count and questions count
    const companyIds = companies.map((c) => c._id);

    const experienceCounts = await InterviewExperience.aggregate([
      { $match: { companyId: { $in: companyIds }, status: 'Approved' } },
      { $group: { _id: '$companyId', count: { $sum: 1 } } },
    ]);

    const questionCounts = await Question.aggregate([
      { $match: { companyId: { $in: companyIds }, status: 'published' } },
      { $group: { _id: '$companyId', count: { $sum: 1 } } },
    ]);

    const expMap = {};
    experienceCounts.forEach((item) => {
      expMap[item._id.toString()] = item.count;
    });

    const qMap = {};
    questionCounts.forEach((item) => {
      qMap[item._id.toString()] = item.count;
    });

    const enhancedCompanies = companies.map((c) => ({
      ...c,
      approvedExperiencesCount: expMap[c._id.toString()] || 0,
      questionsCount: qMap[c._id.toString()] || 0,
    }));

    res.status(200).json({
      success: true,
      count: companies.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: enhancedCompanies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get company details by ID or Slug
// @route   GET /api/companies/:id
// @access  Public
const getCompanyByIdOrSlug = async (req, res, next) => {
  try {
    const { id } = req.params;
    let company;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      company = await Company.findById(id).lean();
    } else {
      company = await Company.findOne({ slug: id.toLowerCase() }).lean();
    }

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found.',
      });
    }

    // Fetch active placement drives for this company
    const placementDrives = await PlacementDrive.find({ companyId: company._id })
      .sort({ driveYear: -1 })
      .lean();

    // Fetch approved interview experiences
    const experiences = await InterviewExperience.find({
      companyId: company._id,
      status: 'Approved',
    })
      .populate('studentId', 'name department graduationYear')
      .populate('placementDriveId', 'title driveYear')
      .sort({ createdAt: -1 })
      .lean();

    // Fetch related questions count and preview
    const questionsCount = await Question.countDocuments({
      companyId: company._id,
      status: 'published',
    });

    const resourcesCount = await StudyResource.countDocuments({
      companyId: company._id,
      status: 'published',
    });

    res.status(200).json({
      success: true,
      data: {
        ...company,
        placementDrives,
        experiences,
        stats: {
          approvedExperiencesCount: experiences.length,
          questionsCount,
          resourcesCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get interview pattern insights for a company
// @route   GET /api/companies/:id/insights
// @access  Public
const getCompanyInsights = async (req, res, next) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    const approvedExperiences = await InterviewExperience.find({
      companyId: company._id,
      status: 'Approved',
    }).lean();

    const sampleSize = approvedExperiences.length;

    // Difficulty breakdown
    const difficultyCounts = { Easy: 0, Medium: 0, Hard: 0 };
    const roundTypes = {};
    const topicFrequency = {};

    approvedExperiences.forEach((exp) => {
      if (difficultyCounts[exp.difficulty] !== undefined) {
        difficultyCounts[exp.difficulty]++;
      }

      if (Array.isArray(exp.rounds)) {
        exp.rounds.forEach((round) => {
          const type = round.roundType || 'Technical';
          roundTypes[type] = (roundTypes[type] || 0) + 1;

          if (Array.isArray(round.topicsCovered)) {
            round.topicsCovered.forEach((topic) => {
              if (topic) {
                const t = topic.trim();
                topicFrequency[t] = (topicFrequency[t] || 0) + 1;
              }
            });
          }
        });
      }
    });

    // Format top topics
    const topTopics = Object.entries(topicFrequency)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const roundDistribution = Object.entries(roundTypes).map(([type, count]) => ({
      roundType: type,
      count,
    }));

    res.status(200).json({
      success: true,
      sampleSize,
      insights: {
        difficultyBreakdown: [
          { difficulty: 'Easy', count: difficultyCounts.Easy },
          { difficulty: 'Medium', count: difficultyCounts.Medium },
          { difficulty: 'Hard', count: difficultyCounts.Hard },
        ],
        roundDistribution,
        roundTypeBreakdown: roundDistribution,
        topTopics,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get company preparation roadmap
// @route   GET /api/companies/:id/roadmap
// @access  Public
const getCompanyRoadmap = async (req, res, next) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    const defaultRoadmap = [
      {
        stepId: 'step_1',
        order: 1,
        title: `Understand ${company.name}'s Hiring Process & Eligibility`,
        description: `Review the hiring workflow, CGPA cutoffs, service agreements, and rounds for ${company.name}.`,
        category: 'Research',
      },
      {
        stepId: 'step_2',
        order: 2,
        title: 'Master Core Aptitude & Logical Reasoning',
        description: 'Practice quantitative aptitude, data interpretation, and verbal ability tests.',
        category: 'Aptitude',
      },
      {
        stepId: 'step_3',
        order: 3,
        title: 'Strengthen CS Fundamentals (DSA, OS, DBMS, Networks)',
        description: `Deep dive into Data Structures, Algorithms, SQL queries, and Operating Systems concepts relevant to ${company.skills.join(', ')}.`,
        category: 'Technical',
      },
      {
        stepId: 'step_4',
        order: 4,
        title: `Solve ${company.name}-Specific Practice Questions`,
        description: `Practice curated coding problems and technical questions tailored to ${company.name}'s past patterns.`,
        category: 'Coding',
      },
      {
        stepId: 'step_5',
        order: 5,
        title: 'Analyze Approved Senior Interview Experiences',
        description: 'Read approved experiences from placed seniors to understand real round-by-round dynamics.',
        category: 'Experiences',
      },
      {
        stepId: 'step_6',
        order: 6,
        title: 'HR, Behavioral, and Leadership Preparation',
        description: 'Craft answers using the STAR method for behavioral questions and company values.',
        category: 'HR',
      },
      {
        stepId: 'step_7',
        order: 7,
        title: 'Mock Interview & Resume Final Polish',
        description: 'Perform a full mock technical interview and align resume projects with company tech stacks.',
        category: 'Mock',
      },
    ];

    res.status(200).json({
      success: true,
      company: {
        _id: company._id,
        name: company.name,
      },
      roadmap: defaultRoadmap,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompanies,
  getCompanyByIdOrSlug,
  getCompanyInsights,
  getCompanyRoadmap,
};
