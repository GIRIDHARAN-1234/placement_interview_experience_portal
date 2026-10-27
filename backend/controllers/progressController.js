const PreparationProgress = require('../models/PreparationProgress');
const StudyTask = require('../models/StudyTask');
const Bookmark = require('../models/Bookmark');
const Question = require('../models/Question');
const Company = require('../models/Company');

// @desc    Get preparation progress for logged-in user
// @route   GET /api/progress
// @access  Private (Student)
const getProgress = async (req, res, next) => {
  try {
    const { companyId } = req.query;
    const query = { userId: req.user._id };

    if (companyId) {
      query.companyId = companyId;
    }

    let progress = await PreparationProgress.findOne(query)
      .populate('companyId', 'name slug logoUrl')
      .populate('completedQuestions', 'title category difficulty');

    if (!progress) {
      // Return empty default state without error
      return res.status(200).json({
        success: true,
        data: {
          roadmapItems: [],
          completedQuestions: [],
          weakTopics: [],
          targetDate: null,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle or update a roadmap step for a company
// @route   PUT /api/progress/roadmap-step
// @access  Private (Student)
const updateRoadmapStep = async (req, res, next) => {
  try {
    const { companyId, stepId, title, completed } = req.body;

    let progress = await PreparationProgress.findOne({
      userId: req.user._id,
      companyId: companyId || null,
    });

    if (!progress) {
      progress = new PreparationProgress({
        userId: req.user._id,
        companyId: companyId || null,
        roadmapItems: [],
        completedQuestions: [],
        weakTopics: [],
      });
    }

    const existingStepIndex = progress.roadmapItems.findIndex((item) => item.stepId === stepId);

    if (existingStepIndex > -1) {
      progress.roadmapItems[existingStepIndex].completed = completed;
      progress.roadmapItems[existingStepIndex].completedAt = completed ? new Date() : null;
    } else {
      progress.roadmapItems.push({
        stepId,
        title: title || `Step ${stepId}`,
        completed,
        completedAt: completed ? new Date() : null,
      });
    }

    progress.updatedAt = new Date();
    await progress.save();

    res.status(200).json({
      success: true,
      message: 'Roadmap step updated successfully.',
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle question completion status
// @route   POST /api/progress/toggle-question
// @access  Private (Student)
const toggleQuestionCompleted = async (req, res, next) => {
  try {
    const { questionId } = req.body;

    let progress = await PreparationProgress.findOne({
      userId: req.user._id,
      companyId: null, // general progress
    });

    if (!progress) {
      progress = new PreparationProgress({
        userId: req.user._id,
        companyId: null,
        roadmapItems: [],
        completedQuestions: [],
        weakTopics: [],
      });
    }

    const index = progress.completedQuestions.findIndex(
      (id) => id.toString() === questionId.toString()
    );

    let isCompleted = false;
    if (index > -1) {
      progress.completedQuestions.splice(index, 1);
      isCompleted = false;
    } else {
      progress.completedQuestions.push(questionId);
      isCompleted = true;
    }

    await progress.save();

    res.status(200).json({
      success: true,
      completed: isCompleted,
      completedCount: progress.completedQuestions.length,
      message: isCompleted ? 'Marked as completed.' : 'Removed from completed list.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate Placement Readiness Score
// @route   GET /api/progress/readiness-score
// @access  Private (Student)
const getReadinessScore = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch user progress records
    const [progressRecords, tasks, bookmarks, totalQuestionsCount] = await Promise.all([
      PreparationProgress.find({ userId }),
      StudyTask.find({ userId }),
      Bookmark.find({ userId }),
      Question.countDocuments({ status: 'published' }),
    ]);

    // Aggregate completed questions across all progress
    const completedQuestionSet = new Set();
    let completedRoadmapSteps = 0;
    let totalRoadmapSteps = 0;

    progressRecords.forEach((p) => {
      if (Array.isArray(p.completedQuestions)) {
        p.completedQuestions.forEach((qId) => completedQuestionSet.add(qId.toString()));
      }
      if (Array.isArray(p.roadmapItems)) {
        totalRoadmapSteps += p.roadmapItems.length;
        completedRoadmapSteps += p.roadmapItems.filter((item) => item.completed).length;
      }
    });

    const completedQuestionsCount = completedQuestionSet.size;

    // Task metric
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;

    // 1. Question Practice Component (Max 35 points)
    // Target 25 questions for full score in this bracket
    const questionScore = Math.min(35, Math.round((completedQuestionsCount / 25) * 35));

    // 2. Roadmap Milestone Component (Max 30 points)
    const roadmapScore =
      totalRoadmapSteps > 0
        ? Math.min(30, Math.round((completedRoadmapSteps / Math.max(7, totalRoadmapSteps)) * 30))
        : 5; // Starter 5 points

    // 3. Task Execution Component (Max 20 points)
    const taskScore =
      totalTasks > 0
        ? Math.min(20, Math.round((completedTasks / totalTasks) * 20))
        : 5;

    // 4. Resource & Experience Bookmarking Component (Max 15 points)
    const bookmarkScore = Math.min(15, Math.round((bookmarks.length / 8) * 15));

    // Overall Score (0 to 100)
    const totalScore = Math.min(100, questionScore + roadmapScore + taskScore + bookmarkScore);

    // Identify weak topics or areas for improvement
    const improvementAreas = [];
    if (questionScore < 20) {
      improvementAreas.push('Practice at least 15 more technical questions from core CS topics.');
    }
    if (roadmapScore < 15) {
      improvementAreas.push('Follow and check off company-specific preparation roadmap milestones.');
    }
    if (completedTasks < 3) {
      improvementAreas.push('Create and complete at least 3 daily or weekly study goals.');
    }
    if (bookmarks.length < 4) {
      improvementAreas.push('Bookmark challenging interview questions and top study resources for regular revision.');
    }

    res.status(200).json({
      success: true,
      data: {
        readinessScore: totalScore,
        breakdown: {
          questions: {
            score: questionScore,
            max: 35,
            completed: completedQuestionsCount,
            target: 25,
          },
          roadmap: {
            score: roadmapScore,
            max: 30,
            completed: completedRoadmapSteps,
            total: totalRoadmapSteps || 7,
          },
          studyTasks: {
            score: taskScore,
            max: 20,
            completed: completedTasks,
            total: totalTasks,
          },
          engagement: {
            score: bookmarkScore,
            max: 15,
            bookmarksCount: bookmarks.length,
          },
        },
        improvementAreas,
        disclaimer:
          'This Placement Readiness Score is an indicator of preparation consistency and subject coverage. It does not guarantee placement offers.',
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProgress,
  updateRoadmapStep,
  toggleQuestionCompleted,
  getReadinessScore,
};
