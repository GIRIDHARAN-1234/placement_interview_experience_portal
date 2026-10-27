const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Company description is required'],
      trim: true,
    },
    logoUrl: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
    },
    jobRoles: {
      type: [String],
      required: [true, 'At least one job role is required'],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

companySchema.index({ name: 'text', description: 'text', industry: 'text', skills: 'text' });

const Company = mongoose.model('Company', companySchema);
module.exports = Company;
