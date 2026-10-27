const mongoose = require('mongoose');

const helpfulVoteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    experienceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewExperience',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce one helpful vote per student per experience
helpfulVoteSchema.index({ userId: 1, experienceId: 1 }, { unique: true });

const HelpfulVote = mongoose.model('HelpfulVote', helpfulVoteSchema);
module.exports = HelpfulVote;
