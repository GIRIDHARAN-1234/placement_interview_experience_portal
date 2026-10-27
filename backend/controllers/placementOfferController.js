const PlacementOffer = require('../models/PlacementOffer');
const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @desc    Get eligible companies/drives for the logged-in student
// @route   GET /api/placement-offers/my-eligibility
// @access  Private (Student)
const getMyEligibility = async (req, res, next) => {
  try {
    const offers = await PlacementOffer.find({
      studentId: req.user._id,
      status: 'selected',
    })
      .populate('companyId', 'name slug logoUrl industry')
      .populate('placementDriveId', 'title driveYear jobRoles')
      .sort({ createdAt: -1 });

    const eligibilityList = offers
      .filter((o) => o.companyId && o.placementDriveId)
      .map((offer) => ({
        offerId: offer._id,
        company: offer.companyId,
        placementDrive: offer.placementDriveId,
        jobRole: offer.jobRole,
        verifiedAt: offer.verifiedAt,
      }));

    res.status(200).json({
      success: true,
      count: eligibilityList.length,
      data: eligibilityList,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all placement offers (Admin only)
// @route   GET /api/placement-offers
// @access  Private (Admin)
const getPlacementOffers = async (req, res, next) => {
  try {
    const { companyId, driveId, studentId, status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (companyId) query.companyId = companyId;
    if (driveId) query.placementDriveId = driveId;
    if (studentId) query.studentId = studentId;
    if (status) query.status = status;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await PlacementOffer.countDocuments(query);
    const offers = await PlacementOffer.find(query)
      .populate('studentId', 'name email registerNumber department graduationYear')
      .populate('companyId', 'name slug logoUrl')
      .populate('placementDriveId', 'title driveYear')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: offers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a placement offer (Admin only)
// @route   POST /api/placement-offers
// @access  Private (Admin)
const createPlacementOffer = async (req, res, next) => {
  try {
    const { studentId, companyId, placementDriveId, status, jobRole, notes } = req.body;

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student account not found.' });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found.' });
    }

    const drive = await PlacementDrive.findById(placementDriveId);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Placement drive not found.' });
    }

    // Check for existing offer record
    const existing = await PlacementOffer.findOne({
      studentId,
      companyId,
      placementDriveId,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A placement offer record already exists for this student, company, and drive.',
      });
    }

    const offer = await PlacementOffer.create({
      studentId,
      companyId,
      placementDriveId,
      status: status || 'selected',
      jobRole: jobRole || drive.jobRoles[0] || 'Software Engineer',
      notes: notes || '',
      verifiedBy: req.user._id,
      verifiedAt: new Date(),
    });

    // Record audit log
    await AuditLog.create({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'OFFER_CREATED',
      entityType: 'PlacementOffer',
      entityId: offer._id,
      safeMetadata: {
        studentRegisterNumber: student.registerNumber,
        companyName: company.name,
        status: offer.status,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Placement offer created and verified successfully.',
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update placement offer status (Admin only)
// @route   PUT /api/placement-offers/:id/status
// @access  Private (Admin)
const updatePlacementOfferStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const offer = await PlacementOffer.findById(req.params.id)
      .populate('studentId', 'name registerNumber')
      .populate('companyId', 'name');

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Placement offer not found.' });
    }

    const previousStatus = offer.status;
    offer.status = status;
    if (notes !== undefined) offer.notes = notes;
    offer.verifiedBy = req.user._id;
    offer.verifiedAt = new Date();
    await offer.save();

    // Record audit log
    await AuditLog.create({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'OFFER_STATUS_UPDATED',
      entityType: 'PlacementOffer',
      entityId: offer._id,
      safeMetadata: {
        previousStatus,
        newStatus: status,
        studentRegisterNumber: offer.studentId?.registerNumber,
        companyName: offer.companyId?.name,
      },
    });

    res.status(200).json({
      success: true,
      message: `Offer status updated from ${previousStatus} to ${status}.`,
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk import placement offers (Admin only)
// @route   POST /api/placement-offers/bulk
// @access  Private (Admin)
const bulkImportPlacementOffers = async (req, res, next) => {
  try {
    const { offers } = req.body; // array of { registerNumber, companyId, placementDriveId, status, jobRole, notes }

    if (!Array.isArray(offers) || offers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'An array of placement offers is required for bulk import.',
      });
    }

    const results = {
      imported: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 0; i < offers.length; i++) {
      const item = offers[i];
      const rowNum = i + 1;

      try {
        if (!item.registerNumber || !item.companyId || !item.placementDriveId) {
          results.failed++;
          results.errors.push({
            row: rowNum,
            message: 'Missing registerNumber, companyId, or placementDriveId.',
          });
          continue;
        }

        const student = await User.findOne({
          registerNumber: item.registerNumber.toUpperCase().trim(),
        });
        if (!student) {
          results.failed++;
          results.errors.push({
            row: rowNum,
            message: `Student with register number ${item.registerNumber} not found.`,
          });
          continue;
        }

        const existing = await PlacementOffer.findOne({
          studentId: student._id,
          companyId: item.companyId,
          placementDriveId: item.placementDriveId,
        });

        if (existing) {
          existing.status = item.status || 'selected';
          if (item.jobRole) existing.jobRole = item.jobRole;
          existing.verifiedBy = req.user._id;
          existing.verifiedAt = new Date();
          await existing.save();
          results.imported++;
        } else {
          await PlacementOffer.create({
            studentId: student._id,
            companyId: item.companyId,
            placementDriveId: item.placementDriveId,
            status: item.status || 'selected',
            jobRole: item.jobRole || 'Software Engineer',
            notes: item.notes || 'Imported via placement administration',
            verifiedBy: req.user._id,
            verifiedAt: new Date(),
          });
          results.imported++;
        }
      } catch (err) {
        results.failed++;
        results.errors.push({ row: rowNum, message: err.message });
      }
    }

    // Audit log
    await AuditLog.create({
      actorId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'OFFERS_BULK_IMPORTED',
      entityType: 'PlacementOffer',
      safeMetadata: {
        totalProcessed: offers.length,
        importedCount: results.imported,
        failedCount: results.failed,
      },
    });

    res.status(200).json({
      success: true,
      message: `Bulk import completed. Imported: ${results.imported}, Failed: ${results.failed}.`,
      results,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyEligibility,
  getPlacementOffers,
  createPlacementOffer,
  updatePlacementOfferStatus,
  bulkImportPlacementOffers,
};
