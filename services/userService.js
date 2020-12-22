const mongoose = require("mongoose");
const moment = require("moment-timezone");
const User = require("../models/user");
const Conversations = require("../models/conversations");
const changeMentorFeedback = require("../models/changeMentorFeedback");
const Thumbs = require("../models/thumbs");
const today = moment().startOf("day");

const findUserByEmail = (email) => {
  return User.findOne({ email: email });
};

const findByNameEmail = (email, name) => {
  return User.findOne({ $or: [{ email: email }, { userName: name }] });
};
const getUserById = (id) => {
  return User.findOne({ _id: id });
};
const verifyUser = (_id) => {
  return User.updateOne({ _id }, { $set: { isVerified: true } });
};
const createNewUser = (user) => {
  const newUser = new User(user);
  return newUser.save();
};

const updateUser = (userId, user) => {
  return User.findOneAndUpdate(
    { _id: userId },
    {
      $set: { ...user },
    },
    { new: true }
  );
};
const updatePassword = (_id, password) => {
  return User.findOneAndUpdate(
    { _id },
    {
      $set: { password },
    },
    { new: true }
  );
};
const getAllUsers = () => {
  return User.find();
};
const getUserByType = (userType) => {
  if (userType === "MENTEE") {
    return User.find({ userType }).populate("userMentor");
  } else {
    return User.find({ userType });
  }
};
const deleteUser = (id) => {
  return User.deleteOne({ _id: id });
};
const assignMentorToMentee = (menteeId, mentorId) => {
  return User.updateOne({ _id: menteeId }, { userMentor: mentorId });
};
const assignMenteeToMentor = (menteeId, mentorId) => {
  return User.updateOne(
    { _id: mentorId },
    { $push: { userMentees: menteeId } }
  );
};
const removeMenteeFromMentor = (menteeId, mentorId) => {
  return User.updateOne(
    { _id: mentorId },
    { $pullAll: { userMentees: [menteeId] } }
  );
};
const removeMentorFromMentee = (menteeId) => {
  return User.updateOne({ _id: menteeId }, { userMentor: null });
};
const createConversation = (menteeId, mentorId) => {
  const queryObj = {
    menteeId,
    mentorId,
  };
  const newConversation = new Conversations(queryObj);
  return newConversation.save();
};
const disableConversation = (menteeId, mentorId) => {
  return Conversations.updateOne({ menteeId, mentorId }, { status: false });
};
const findUserConversations = (userId) => {
  return Conversations.find({
    $or: [{ mentorId: userId }, { menteeId: userId }],
  })
    .populate("mentorId", "fullName userAvatar _id userType")
    .populate("menteeId", "fullName userAvatar _id userType");
};
const findConversationWithMenteeAndMentor = (menteeId, mentorId) => {
  return Conversations.findOne({ menteeId, mentorId });
};
const getAllConversations = () => {
  return Conversations.find();
};
const getTotalNoOfUsers = () => {
  return User.estimatedDocumentCount();
};
const getOngoingConversations = () => {
  return User.find({
    userType: "MENTEE",
    lastLoggedIn: {
      $gte: today.toDate(),
      $lte: moment(today).endOf("day").toDate(),
    },
  })
    .limit(5)
    .populate("userMentor");
};
const changeMentorReason = (obj) => {
  const feedback = new changeMentorFeedback(obj);
  return feedback.save();
};
const getConversationCommentsByMonth = async (conversationId, month) => {
  return Thumbs.aggregate([
    { $addFields: { month: { $month: "$createdAt" } } },
    {
      $match: {
        month: parseInt(month),
        conversationId: mongoose.Types.ObjectId(conversationId),
        createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) },
      },
    },
  ]);
};
const countTotalThumbsForUserInConversation = (userId, conversationId) => {
  return Thumbs.countDocuments({ userId, conversationId });
};
const countPositiveThumbsForUserInConversation = (userId, conversationId) => {
  return Thumbs.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        conversationId: mongoose.Types.ObjectId(conversationId),
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
const findStatsPerMonth = (userId, conversationId) => {
  return Thumbs.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        conversationId: mongoose.Types.ObjectId(conversationId),
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
  findUserByEmail,
  updateUser,
  getAllUsers,
  findByNameEmail,
  createNewUser,
  getUserById,
  verifyUser,
  updatePassword,
  deleteUser,
  getUserByType,
  assignMenteeToMentor,
  assignMentorToMentee,
  removeMenteeFromMentor,
  removeMentorFromMentee,
  createConversation,
  disableConversation,
  findUserConversations,
  getTotalNoOfUsers,
  getOngoingConversations,
  changeMentorReason,
  getConversationCommentsByMonth,
  getAllConversations,
  findConversationWithMenteeAndMentor,
  countTotalThumbsForUserInConversation,
  countPositiveThumbsForUserInConversation,
  findStatsPerMonth,
};
