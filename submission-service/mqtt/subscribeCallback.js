const mongoose = require('mongoose')
const Target = mongoose.model('Target')
const Submission = mongoose.model('Submission')


async function createTarget(content) {
    if (await Target.countDocuments({ _id: content.target._id }) == 0)
        await Target.create(content.target);
}

async function deleteTarget(content) {
  await Target.deleteOne({ _id: content.id }).then(
    async() => await Submission.deleteMany({ targetId: content.id })
  )
}


async function deleteSubmission(submissionId) {
    await Submission.findByIdAndRemove(submissionId)
}



module.exports = {
    createTarget: createTarget,
    deleteTarget: deleteTarget,
    deleteSubmission: deleteSubmission,
} 