const mongoose = require('mongoose');

const placementDriveSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Drive title is required'],
      trim: true,
    },
    driveYear: {
      type: Number,
      required: [true, 'Drive year is required'],
    },
    jobRoles: {
      type: [String],
      required: [true, 'At least one eligible job role is required'],
    },
    eligibleDepartments: {
      type: [String],
      required: [true, 'Eligible departments are required'],
      default: ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication Engineering'],
    },
    graduationYears: {
      type: [Number],
      required: [true, 'Graduation years are required'],
      default: [2025, 2026],
    },
    driveDates: {
      startDate: { type: Date },
      endDate: { type: Date },
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'ongoing',
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

placementDriveSchema.index({ companyId: 1, driveYear: 1 });

const PlacementDrive = mongoose.model('PlacementDrive', placementDriveSchema);
module.exports = PlacementDrive;
