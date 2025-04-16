const mongoose = require('mongoose');

const targetSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  starttime: {
    type: Date,
    required: true
  },
  endtime: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return value > this.starttime;
      }
    }
  },
  description: {
    type: String,
    required: true
  },
  imageData: {
    type: String,
    required: true,
    unique: true
  }
});

/* Makes this combination unique, so this is used as a form of validation (besides just indexing) */
targetSchema.index({ user_id: 1, imageData: 1 }, { unique: true });

const Target = mongoose.model('Target', targetSchema);

module.exports = Target;
