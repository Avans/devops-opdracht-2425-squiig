const mongoose = require('mongoose')
const Target = mongoose.model('Target')
const Submission = mongoose.model('Submission')


async function createTarget(content) {
  if (await Target.countDocuments({ _id: content.target._id }) == 0)
    await Target.create(content.target);
}

async function deleteTarget(content) {
  await Target.deleteOne({ _id: content.id }).then(
    async () => await Submission.deleteMany({ targetId: content.id })
  )
}
async function createSubmission(content) {
  if (await Submission.countDocuments({ _id: content.submission._id }) == 0)
    await Submission.create(content.submission);
}

async function deleteSubmission(content) {
  await Submission.deleteOne({ _id: content._id })
}



module.exports = {
  createTarget: createTarget,
  deleteTarget: deleteTarget,
  createSubmission: createSubmission,
  deleteSubmission: deleteSubmission,
}
