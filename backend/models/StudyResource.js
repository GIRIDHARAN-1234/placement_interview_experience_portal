const mongoose = require('mongoose');

const studyResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Resource description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
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
    resourceType: {
      type: String,
      enum: ['article', 'pdf', 'video', 'link', 'guide'],
      default: 'link',
    },
    resourceUrl: {
      type: String,
      trim: true,
      default: '',
    },
    fileReference: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['published', 'draft'],
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

studyResourceSchema.index({ title: 'text', description: 'text', topicTags: 'text' });

const StudyResource = mongoose.model('StudyResource', studyResourceSchema);
module.exports = StudyResource;
