const moment = require("moment-timezone");
const User = require("../models/user");
const Analytics = require("../models/analytics");
const Thumbs = require("../models/thumbs");
const today = moment().startOf("day");

const getUserWithBirthdays = () => {
  return User.aggregate([
    {
      $match: {
        $expr: {
          $and: [
            {
              $eq: [
                { $dayOfMonth: "$dateOfBirth" },
                { $dayOfMonth: new Date() },
              ],
            },
            { $eq: [{ $month: "$dateOfBirth" }, { $month: new Date() }] },
          ],
        },
      },
    },
  ]);
};
const todayAnalytics = () => {
  return Analytics.findOne({
    dated: {
      $gte: today.toDate(),
      $lte: moment(today).endOf("day").toDate(),
    },
  });
};
const userExperiencePerMonth = (month, year) => {
  return Analytics.find({ month, year });
};

const addThumb = (queryObj) => {
  const thumb = new Thumbs(queryObj);
  return thumb.save();
};
const incrementUniqeLogin = () => {
  let options = { upsert: true, new: true, setDefaultsOnInsert: true };
  return Analytics.updateOne(
    {
      dated: {
        $gte: today.toDate(),
        $lte: moment(today).endOf("day").toDate(),
      },
    },
    { $inc: { spoken: 1 } },
    options
  );
};
const incrementTimeSpentByUser = async (minutes) => {
  let options = { upsert: true, new: true, setDefaultsOnInsert: true };
  await Analytics.updateOne(
    {
      dated: {
        $gte: today.toDate(),
        $lte: moment(today).endOf("day").toDate(),
      },
    },
    { $inc: { totalTimeSpent: minutes } },
    options
  );
};

const getTodayThumbsDetail = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Thumbs.aggregate([
    {
      $match: {
        createdAt: { $gte: today },
      },
    },
    {
      $group: {
        _id: null,
        thumbsUp: { $sum: { $cond: [{ $eq: ["$thumbValue", true] }, 1, 0] } },
        totalThumbs: { $sum: 1 },
      },
    },
  ]);
};
const userExperienceForAllMonths = () => {
  return Thumbs.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) },
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        thumbsUp: { $sum: { $cond: [{ $eq: ["$thumbValue", true] }, 1, 0] } },
        totalThumbs: { $sum: 1 },
      },
    },
  ]);
};
module.exports = {
  getUserWithBirthdays,
  todayAnalytics,
  addThumb,
  userExperiencePerMonth,
  incrementUniqeLogin,
  getTodayThumbsDetail,
  userExperienceForAllMonths,
  incrementTimeSpentByUser,
};
