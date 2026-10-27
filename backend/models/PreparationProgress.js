const mongoose = require('mongoose');

const roadmapItemSchema = new mongoose.Schema({
  stepId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
});

const preparationProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
    },
    roadmapItems: {
      type: [roadmapItemSchema],
      default: [],
    },
    completedQuestions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    weakTopics: {
      type: [String],
      default: [],
    },
    targetDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

preparationProgressSchema.index({ userId: 1, companyId: 1 });

const PreparationProgress = mongoose.model('PreparationProgress', preparationProgressSchema);
module.exports = PreparationProgress;
