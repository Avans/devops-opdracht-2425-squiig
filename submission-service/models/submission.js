const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
	createdByUser: { type: String, required: true },
	image: { type: String, required: true, unique: true },
	targetId: { type: String, required: true },
	score: { type: Number, required: false }
});

/* Makes the combination of createdByUser and targetId unique, 
so this is used as a form of validation (besides just indexing) */
submissionSchema.index({ createdByUser: 1, targetId: 1 }, { unique: true });

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;
