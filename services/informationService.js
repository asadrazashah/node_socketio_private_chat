const moment = require("moment");
const Sponsor = require("../models/sponsor");
const learnMore = require("../models/learnMore");
const Announcment = require("../models/announcment");
const today = moment().startOf("day");

const getSponsorsList = () => {
  return Sponsor.find();
};
const addSponsor = (sponsor) => {
  const newSponsor = new Sponsor({ ...sponsor });
  return newSponsor.save();
};

const getLearnMorePosts = () => {
  return learnMore.find();
};
const addlearnMorePost = (learnMorePost) => {
  const newlearnMorePost = new learnMore({ ...learnMorePost });
  return newlearnMorePost.save();
};
const getAnnouncments = () => {
  return Announcment.find();
};
const addNewAnnouncment = (announcment) => {
  const newAnnouncment = new Announcment({ ...announcment });
  return newAnnouncment.save();
};
const getLatestAnnouncment = () => {
  return Announcment.findOne({
    createdAt: {
      $gte: today.toDate(),
      $lte: moment(today).endOf("day").toDate(),
    },
  }).sort({ createdAt: -1 });
};
module.exports = {
  getAnnouncments,
  addNewAnnouncment,
  getSponsorsList,
  addSponsor,
  getLearnMorePosts,
  addlearnMorePost,
  getLatestAnnouncment,
};
