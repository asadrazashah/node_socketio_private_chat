const mongoose = require("mongoose");
const Message = require("../models/message");
const User = require("../models/user");
const Conversations = require("../models/conversations");

const insertMessage = (message) => {
  const newMessage = new Message(message);
  return newMessage.save();
};

const getMessages = (userId, toUserId) => {
  const data = {
    $or: [
      {
        $and: [
          {
            toUserId: userId,
          },
          {
            fromUserId: toUserId,
          },
        ],
      },
      {
        $and: [
          {
            toUserId: toUserId,
          },
          {
            fromUserId: userId,
          },
        ],
      },
    ],
  };
  return Message.find(data).sort({ createdAt: 1 });
};
const getMessagesWithConversationId = (conversationId) => {
  return Message.find({ conversationId: conversationId });
};
const userSessionCheck = (userId) => {
  return User.findOne({ _id: userId, online: true });
};
const getUserInfo = (userId) => {
  return User.findOne({ _id: userId }, "socketId");
};

const getConversationWithMessages = async (userId) => {
  const conversations = await Conversations.aggregate([
    {
      $match: {
        $or: [
          { menteeId: mongoose.Types.ObjectId(userId) },
          { mentorId: mongoose.Types.ObjectId(userId) },
        ],
        status: true,
      },
    },
    {
      $lookup: {
        from: "messages",
        localField: "_id",
        foreignField: "conversationId",
        as: "messages",
      },
    },
    {
      $unwind: {
        path: "$messages",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$messages.unread",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        isMatch: {
          $and: [
            { $ne: ["$messages.fromUserId", mongoose.Types.ObjectId(userId)] },
            { $eq: ["$messages.unread", true] },
          ],
        },
      },
    },
    {
      $group: {
        _id: "$_id",
        count: { $sum: { $cond: ["$isMatch", 1, 0] } },
        menteeId: { $first: "$menteeId" },
        mentorId: { $first: "$mentorId" },
        messages: { $push: "$messages" },
      },
    },
  ]);
  return Conversations.populate(conversations, {
    path: "menteeId mentorId",
    select: "fullName userAvatar _id",
  });
};
const getAllConversationsWithSingleMessage = async () => {
  const conversations = await Conversations.aggregate([
    {
      $lookup: {
        from: "messages",
        localField: "_id",
        foreignField: "conversationId",
        as: "messages",
      },
    },
    { $sort: { "messages.createdAt": -1 } },
    { $unwind: "$messages" },
    {
      $group: {
        _id: "$_id",
        menteeId: { $first: "$menteeId" },
        mentorId: { $first: "$mentorId" },
        lastMessage: { $last: "$messages" },
      },
    },
  ]);
  return Conversations.populate(conversations, {
    path: "menteeId mentorId",
    select: "fullName userAvatar _id",
  });
};
const getMessagesCountInConversation = (conversationId) => {
  return Message.countDocuments({ conversationId });
};
const changeMessagesToRead = (conversationId, userId) => {
  return Message.updateMany(
    {
      $and: [{ conversationId }, { fromUserId: { $ne: userId } }],
    },
    { $set: { unread: false } }
  );
};
module.exports = {
  insertMessage,
  getMessages,
  userSessionCheck,
  getUserInfo,
  getMessagesWithConversationId,
  getConversationWithMessages,
  getMessagesCountInConversation,
  getAllConversationsWithSingleMessage,
  changeMessagesToRead,
};
