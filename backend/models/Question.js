const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Question title is required'],
      trim: true,
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
      index: true,
    },
    topicTags: {
      type: [String],
      default: [],
    },
    answer: {
      type: String,
      default: '',
    },
    explanation: {
      type: String,
      default: '',
    },
    codeSnippet: {
      type: String,
      default: '',
    },
    sourceType: {
      type: String,
      enum: ['Curated Practice', 'Student Reported'],
      default: 'Curated Practice',
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'archived'],
      default: 'published',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

questionSchema.index({ title: 'text', questionText: 'text', topicTags: 'text' });

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;
