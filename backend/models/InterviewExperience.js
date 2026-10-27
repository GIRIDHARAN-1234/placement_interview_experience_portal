const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
  roundNumber: {
    type: Number,
    required: true,
  },
  roundName: {
    type: String,
    required: [true, 'Round name is required'],
    trim: true,
  },
  roundType: {
    type: String,
    enum: ['Online Assessment', 'Technical Round', 'System Design', 'Managerial', 'HR', 'Other'],
    default: 'Technical Round',
  },
  description: {
    type: String,
    required: [true, 'Round description is required'],
    trim: true,
  },
  questionsAsked: {
    type: [String],
    default: [],
  },
  topicsCovered: {
    type: [String],
    default: [],
  },
});

const interviewExperienceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
    },
    placementDriveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlacementDrive',
      required: false,
      default: null,
    },
    jobRole: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
    },
    interviewDate: {
      type: Date,
      required: [true, 'Interview date is required'],
    },
    interviewMode: {
      type: String,
      enum: ['on-campus', 'virtual', 'hybrid'],
      default: 'on-campus',
    },
    selectionOutcome: {
      type: String,
      enum: ['Selected', 'Rejected', 'Waiting'],
      default: 'Selected',
    },
    rounds: {
      type: [roundSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one interview round must be provided',
      },
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    preparationStrategy: {
      type: String,
      required: [true, 'Preparation strategy is required'],
      trim: true,
    },
    resourcesRecommended: {
      type: String,
      trim: true,
      default: '',
    },
    advice: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Draft', 'Pending Review', 'Approved', 'Rejected'],
      default: 'Pending Review',
    },
    moderationFeedback: {
      type: String,
      trim: true,
      default: '',
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    moderatedAt: {
      type: Date,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

interviewExperienceSchema.index({ companyId: 1, status: 1 });
interviewExperienceSchema.index({ studentId: 1, status: 1 });
interviewExperienceSchema.index({ status: 1, createdAt: -1 });

const InterviewExperience = mongoose.model('InterviewExperience', interviewExperienceSchema);
module.exports = InterviewExperience;
