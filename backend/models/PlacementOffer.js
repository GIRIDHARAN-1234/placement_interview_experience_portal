const mongoose = require('mongoose');

const placementOfferSchema = new mongoose.Schema(
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
      required: [true, 'Placement Drive ID is required'],
    },
    status: {
      type: String,
      enum: ['selected', 'rejected', 'pending'],
      default: 'selected',
      required: [true, 'Offer status is required'],
    },
    jobRole: {
      type: String,
      trim: true,
      default: 'Software Engineer',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate offer records for the same student, company, and drive
placementOfferSchema.index({ studentId: 1, companyId: 1, placementDriveId: 1 }, { unique: true });
placementOfferSchema.index({ studentId: 1, status: 1 });

const PlacementOffer = mongoose.model('PlacementOffer', placementOfferSchema);
module.exports = PlacementOffer;
