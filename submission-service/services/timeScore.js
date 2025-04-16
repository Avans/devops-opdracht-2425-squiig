function timeScore(target) {
    const endtime = new Date(target.endtime);
    const starttime = target.starttime ? new Date(target.starttime) : new Date();
  
    const totalTime = endtime - starttime;
    const currentTime = new Date();

    const remainingTime = endtime - currentTime;

    const timeRatio = Math.max(0, remainingTime / totalTime);

    const score = Math.floor(timeRatio * 100);
      
    console.log(`${score}% of time`);
    return score;
}

module.exports = timeScore;


