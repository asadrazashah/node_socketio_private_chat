const analyticsService = require("../services/analyticsService");
const userService = require("../services/userService");

module.exports.getUserWithBirthdays = async (req, res) => {
  try {
    const usersWithBirthday = await analyticsService.getUserWithBirthdays();
    if (usersWithBirthday) {
      return res.status(200).json({ usersWithBirthday });
    }
    res.status(400).json({ error: "failed to get users with birthdays" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports.getTodayAnalytics = async (req, res) => {
  try {
    const todayAnalytics = await analyticsService.todayAnalytics();
    const totalUsers = await userService.getTotalNoOfUsers();
    const attendance =
      todayAnalytics && todayAnalytics.spoken ? todayAnalytics.spoken : 0;
    const unspoken = totalUsers - attendance;
    const averageUse =
      todayAnalytics && todayAnalytics.totalTimeSpent
        ? todayAnalytics.totalTimeSpent / totalUsers
        : 0;
    return res.status(200).json({ unspoken, attendance, averageUse });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports.addThumbUpOrDown = async (req, res) => {
  try {
    const { thumbValue, comment } = req.body;
    if (thumbValue === false && comment === "") {
      res.status(400).json({ error: "please provide your feedback" });
    } else {
      await analyticsService.addThumb(req.body);
      res.status(201).json({ message: "response recorded" });
    }
  } catch (error) {
    console.log("error", error.message);
    res.status(400).json({ error: error.message });
  }
};
module.exports.getUserExperienceByMonth = async (req, res) => {
  try {
    const { month, year } = req.query;
    const analytics = await analyticsService.userExperiencePerMonth(
      month,
      year
    );
    let thumbsUp = 0;
    let thumbsDown = 0;
    analytics.forEach((element) => {
      thumbsUp = thumbsUp + element.thumbsUp;
      thumbsDown = thumbsDown + element.thumbsDown;
    });
    const totalThumbs = thumbsUp + thumbsDown;
    const userExperience = (thumbsUp / totalThumbs) * 100;
    return res.status(200).json({ userExperience });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports.addUniqeLogin = async (req, res) => {
  try {
    await analyticsService.incrementUniqeLogin();
    return res.status(200).json({ message: "done" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports.todayThumbsAnalytics = async (req, res) => {
  try {
    const response = await analyticsService.getTodayThumbsDetail();
    if (response.length) {
      let thumbsUp = response[0].thumbsUp;
      let totalThumbs = response[0].totalThumbs;
      let thumbsDown = totalThumbs - thumbsUp;
      res.status(200).json({ thumbsUp, totalThumbs, thumbsDown });
    } else {
      res.status(200).json({ thumbsUp: 0, totalThumbs: 0, thumbsDown: 0 });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
function getMonthName(month) {
  switch (month) {
    case 1:
      return "Jan";
    case 2:
      return "Feb";
    case 3:
      return "Mar";
    case 4:
      return "Apr";
    case 5:
      return "May";
    case 6:
      return "Jun";
    case 7:
      return "July";
    case 8:
      return "Aug";
    case 9:
      return "Sep";
    case 10:
      return "Oct";
    case 11:
      return "Nov";
    case 12:
      return "Dec";
  }
}
module.exports.getThumbsPerMonth = async (req, res) => {
  try {
    const response = await analyticsService.userExperienceForAllMonths();
    const experiencePerMonth = [];
    for (let i = 1; i <= 12; i++) {
      let singleMonth = response.find((month) => month._id === i);
      if (singleMonth) {
        let uv = (singleMonth.thumbsUp / singleMonth.totalThumbs) * 100;
        let thumbsDown = singleMonth.totalThumbs - singleMonth.thumbsUp;
        let pv = (thumbsDown / singleMonth.totalThumbs) * 100;
        let month = getMonthName(i);
        let id = i;
        experiencePerMonth.push({ uv, pv, month, id });
      } else {
        let month = getMonthName(i);
        experiencePerMonth.push({ uv: 0, pv: 0, month, id: i });
      }
    }
    return res.status(200).json({ experiencePerMonth });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
