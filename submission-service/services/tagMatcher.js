const axios = require("axios");

async function compareImage(target, submissionImage) {
  try {
    if (target.imageData === submissionImage) {
      throw {
        name: "BadRequest",
        message: `Target image cannot be exactly the same as entry image.`,
        code: 400,
      };
    }
    const formData = new FormData();
    formData.append("image_base64", submissionImage);

    let entryConfig = {
      method: "post",
      url: `${process.env.IMAGGA_ENDPOINT}/v2/tags`,
      headers: {
        Authorization: "Basic " + process.env.IMAGGA_AUTH,
      },
      data: formData,
    };

    const formData2 = new FormData();
    formData2.append("image_base64", target.imageData);

    let targetConfig = {
      method: "post",
      url: `${process.env.IMAGGA_ENDPOINT}/v2/tags`,
      headers: {
        Authorization: "Basic " + process.env.IMAGGA_AUTH,
      },
      data: formData2,
    };

    try {
      const [firstResponse, secondResponse] = await Promise.all([
        axios.request(targetConfig),
        axios.request(entryConfig),
      ]);

      let score = compareTags(
        firstResponse.data.result.tags,
        secondResponse.data.result.tags
      );
      return score;
    } catch (error) {
      console.log("error with imagga call: " + error);
      throw {
        name: "FailedDependency",
        message: "GetTargetWithTags went wrong!",
        code: 424,
      };
    }
  } catch (error) {
    console.log("error in tagMatcher: " + error);
    throw {
      name: error.name,
      message: error.message,
      code: error.code ?? 500,
    };
  }
}

function compareTags(targetTags, submissionTags) {
  let matchingConfidence = 0;
  for (const targetTag of targetTags) {
    const matchingSubmissionTag = submissionTags.find(
      (tag) => tag.tag.en === targetTag.tag.en
    );
    if (matchingSubmissionTag) {
      matchingConfidence += matchingSubmissionTag.confidence;
    }
  }
  const totalConfidenceAllTags = targetTags.reduce(
    (accumulator, tag) => accumulator + tag.confidence,
    0
  );
  const percentage = Math.round(
    (100 * matchingConfidence) / totalConfidenceAllTags
  );
  console.log(`${percentage}% of matching confidence`);
  return percentage;
}

module.exports.compareImage = compareImage;
