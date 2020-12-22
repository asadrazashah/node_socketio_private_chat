const moment = require("moment-timezone");
const { comparePasswordWithDb, generateToken } = require("./../helpers/helper");
const userService = require("../services/userService");
const analyticsService = require("../services/analyticsService");
const messageService = require("../services/messageService");
const { helpers } = require("../helpers");

module.exports.registerUser = async (req, res) => {
  try {
    const {
      email,
      userType,
      userMentor,
      userMentees,
      password,
      fullName,
      bio,
      country,
    } = req.body;

    const newUser = {
      email,
      userType,
      password,
      fullName,
      bio,
      country,
      userMentor,
      userMentees,
    };
    const user = await userService.findUserByEmail(email);
    if (user && user.email === email) {
      return res.status(303).json({
        message: "account with this email address is already registered",
      });
    }
    const registeredUser = await userService.createNewUser(newUser);
    if (registeredUser) {
      const userId = registeredUser._id;
      try {
        if (userType === "MENTOR" && userMentees) {
          await Promise.all([
            userService.assignMentorToMentee(userMentees[0], userId),
            userService.createConversation(userMentees[0], userId),
          ]);
        } else if (userType === "MENTEE" && userMentor) {
          await Promise.all([
            userService.assignMenteeToMentor(userId, userMentor),
            userService.createConversation(userId, userMentor),
          ]);
        }
      } catch (error) {
        console.log("error", error);
        await userService.deleteUser(userId);
        return res.status(400).json({
          message: "Failed to create new account try again",
        });
      }

      return res.status(201).json({
        user: registeredUser,
        message: "Account is successfully created.",
      });
    } else {
      return res.status(400).json({
        message: "Failed to create new account try again",
      });
    }
  } catch (error) {
    console.log("error last", error);
    res.status(400).json({ error: error.message });
  }
};

module.exports.login = async (req, res) => {
  try {
    const user = await userService.findUserByEmail(req.body.email);
    if (!user)
      return res.status(404).send({ message: "Email is not registered!" });
    const passwordCheck = await comparePasswordWithDb(
      req.body.password,
      user.password
    );
    if (!passwordCheck)
      return res.status(400).send({ message: "Invalid email or password" });
    const token = generateToken(user);
    if (!token)
      return res.status(500).send({ message: "Error in generating token" });
    if (!compareDates(user.lastLoggedIn)) {
      await analyticsService.incrementUniqeLogin();
      await userService.updateUser(user._id, { lastLoggedIn: moment() });
    }
    return res
      .status(201)
      .json({ user, token, message: "Successfully logged in" });
  } catch (error) {
    res.status(400).json({ message: error });
  }
};
const compareDates = (savedDate) => {
  if (moment(savedDate).isSame(moment(), "day")) {
    return true;
  }
  return false;
};

module.exports.getAllUsersByType = async (req, res) => {
  try {
    const users = await userService.getUserByType(req.query.userType);
    res.status(201).json({ users: users });
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res
        .status(400)
        .send({ message: "No account exist with this email" });
    }
    // Send the mail
    const mail = await helpers.sendForgotPasswordByEmail(email, user.password);
    if (mail) {
      return res.status(201).json({
        message: "Your password has been sent to your email.",
      });
    } else {
      return res.status(400).json({
        message: "Failed to send email , try again",
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
// profile user
module.exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({
        message: "no user id provided",
      });
    }
    const user = await userService.getUserById(userId);
    res.status(200).json({
      userProfile: user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports.updateUserProfile = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({
        message: "no user id provided",
      });
    }
    if (req.body.dateOfBirth) {
      const dateOfBirth = moment(req.body.dateOfBirth)
        .tz("GMT")
        .format("YYYY-MM-DD");
      req.body.dateOfBirth = dateOfBirth;
    }
    const user = await userService.updateUser(req.params.id, req.body);
    if (!user) {
      res.status(400).json({ message: "failed to update user profile" });
      return;
    }
    res
      .status(201)
      .json({ userProfile: user, message: "user profile updated" });
  } catch (error) {
    if (error.message) {
      res.status(400).json({ message: error.message });
    } else {
      res.sendStatus(500);
    }
  }
};

module.exports.assignMentorToMentee = async (req, res) => {
  try {
    const { menteeId, mentorId } = req.body;
    if (menteeId === "" || mentorId === "") {
      return res
        .status(400)
        .json({ error: "please provide both mentor and mentee id" });
    }
    const mentee = await userService.getUserById(menteeId);
    if (mentee && mentee.userMentor) {
      return res
        .status(400)
        .json({ error: "Mentee has already been assigned a mentor" });
    }
    await Promise.all([
      userService.assignMentorToMentee(menteeId, mentorId),
      userService.assignMenteeToMentor(menteeId, mentorId),
      userService.createConversation(menteeId, mentorId),
    ]);
    res.status(200).json({ message: "assigned" });
  } catch (error) {
    if (error.message) {
      res.status(400).json({ message: error.message });
    } else {
      res.sendStatus(500);
    }
  }
};

module.exports.removeMentorFromMentee = async (req, res) => {
  try {
    const { menteeId, mentorId } = req.body;
    if (menteeId === "" || mentorId === "") {
      return res
        .status(400)
        .json({ error: "please provide both mentor and mentee id" });
    }
    const mentee = await userService.getUserById(menteeId);
    if (mentee && mentee.userMentor === "") {
      return res
        .status(400)
        .json({ error: "Mentee has no mentor to be removed" });
    }
    await Promise.all([
      userService.removeMentorFromMentee(menteeId),
      userService.removeMenteeFromMentor(menteeId, mentorId),
      userService.disableConversation(menteeId, mentorId),
    ]);
    res.status(200).json({ message: "removed" });
  } catch (error) {
    if (error.message) {
      res.status(400).json({ message: error.message });
    } else {
      res.sendStatus(500);
    }
  }
};

module.exports.getUserConversations = async (req, res) => {
  try {
    const { userId } = req.query;
    const conversations = await userService.findUserConversations(userId);
    if (conversations) {
      return res.status(200).json({ conversations });
    }
    return res
      .status(400)
      .json({ message: "failed to get user conversations" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports.getAllUserConversations = async (req, res) => {
  try {
    const conversations = await messageService.getAllConversationsWithSingleMessage();
    res.status(200).json({ conversations });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
module.exports.getOngoingConversations = async (req, res) => {
  try {
    const users = await userService.getOngoingConversations();
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports.mentorChangeReason = async (req, res) => {
  try {
    if (req.body.conversationId === "") {
      return res.status(400).json({ error: "please provide conversation  id" });
    }
    if (req.body.reason === "") {
      return res
        .status(400)
        .json({ error: "please provide reason to unpair users" });
    }
    await userService.changeMentorReason(req.body);
    return res.status(200).json({ message: "submmited" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports.getConversationCommentsByMonth = async (req, res) => {
  try {
    const { conversationId, month } = req.query;
    if (conversationId === "") {
      return res.status(400).json({ error: "please provide conversation id" });
    }
    const comments = await userService.getConversationCommentsByMonth(
      conversationId,
      month
    );
    res.status(200).json({ comments });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports.editUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      bio,
      country,
      password,
      userMentees,
      userMentor,
      _id,
      matchedUnMatchedMentee,
    } = req.body;
    const newUser = {
      fullName,
      email,
      bio,
      country,
      password,
      userMentees,
      userMentor,
    };
    if (!matchedUnMatchedMentee) {
      try {
        await userService.updateUser(_id, newUser);
        return res.status(200).json({ message: "user edited" });
      } catch (err) {
        return res.status(400).json({ message: "failed to edit user" });
      }
    }
    if (matchedUnMatchedMentee) {
      try {
        await Promise.all([
          userService.assignMenteeToMentor(_id, userMentor),
          userService.createConversation(_id, userMentor),
          userService.updateUser(_id, newUser),
        ]);
        return res.status(200).json({ message: "user edited successfully" });
      } catch (err) {
        return res.status(400).json({ message: "failed to edit user" });
      }
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports.editAlreadyMatchedUsers = async (req, res) => {
  try {
    const {
      _id,
      fullName,
      email,
      bio,
      country,
      password,
      userType,
      simpleEdit,
      oldMentorId,
      newMentorId,
      newMenteeId,
      reason,
    } = req.body;
    if (simpleEdit) {
      const newUser = {
        fullName,
        email,
        bio,
        country,
        password,
      };
      await userService.updateUser(_id, newUser);
      return res.status(200).json({ message: "user edited" });
    }
    if (!simpleEdit && userType === "MENTEE") {
      const newUser = {
        fullName,
        email,
        bio,
        country,
        password,
        userMentor: newMentorId,
      };
      await Promise.all([
        userService.removeMentorFromMentee(_id),
        userService.removeMenteeFromMentor(_id, oldMentorId),
        userService.disableConversation(_id, oldMentorId),
        userService.changeMentorReason({
          menteeId: _id,
          mentorId: oldMentorId,
          reason,
        }),
      ]);
      if (newMentorId) {
        await Promise.all([
          userService.assignMenteeToMentor(_id, newMentorId),
          userService.createConversation(_id, newMentorId),
          userService.updateUser(_id, newUser),
        ]);
      }
      return res.status(200).json({ message: "user edited" });
    }
    if (!simpleEdit && userType === "MENTOR") {
      const newUser = {
        fullName,
        email,
        bio,
        country,
        password,
      };
      await Promise.all([
        userService.assignMentorToMentee(newMenteeId, _id),
        userService.assignMenteeToMentor(newMenteeId, _id),
        userService.createConversation(newMenteeId, _id),
        userService.updateUser(_id, newUser),
      ]);
      return res.status(200).json({ message: "user edited" });
    }
  } catch (error) {
    console.log("error", error.message);
    return res.status(400).json({ error: error.message });
  }
};

module.exports.findConversationWithDetails = async (req, res) => {
  //todo improve this query
  try {
    const { mentorId, menteeId } = req.query;
    const conversation = await userService.findConversationWithMenteeAndMentor(
      menteeId,
      mentorId
    );
    if (conversation) {
      conversationId = conversation._id;
      const [
        messagesCount,
        mentorTotalThumbs,
        menteeTotalThumbs,
        positiveThumbsMentor,
        positiveThumbsMentee,
      ] = await Promise.all([
        messageService.getMessagesCountInConversation(conversationId),
        userService.countTotalThumbsForUserInConversation(
          mentorId,
          conversationId
        ),
        userService.countTotalThumbsForUserInConversation(
          menteeId,
          conversationId
        ),
        userService.countPositiveThumbsForUserInConversation(
          mentorId,
          conversationId
        ),
        userService.countPositiveThumbsForUserInConversation(
          menteeId,
          conversationId
        ),
      ]);

      let menteePositiveRating = positiveThumbsMentee.length
        ? (positiveThumbsMentee[0].thumbsUp / menteeTotalThumbs) * 100
        : 0;
      let mentorPositiveRating = positiveThumbsMentor.length
        ? (positiveThumbsMentor[0].thumbsUp / mentorTotalThumbs) * 100
        : 0;

      return res.status(200).json({
        messagesCount: messagesCount,
        conversationId,
        menteePositiveRating,
        mentorPositiveRating,
      });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports.findStatsForConversationByMonth = async (req, res) => {
  try {
    const { conversationId, mentorId, menteeId } = req.query;
    const [mentorStats, menteeStats] = await Promise.all([
      userService.findStatsPerMonth(mentorId, conversationId),
      userService.findStatsPerMonth(menteeId, conversationId),
    ]);
    let currentMonth = new Date().getMonth() + 1;
    let comparison = [];
    for (let i = currentMonth; i >= 1; i--) {
      let menteeMonth = menteeStats.find((month) => month._id === i);
      let mentorMonth = mentorStats.find((month) => month._id === i);
      let menteeRating = 0;
      let mentorRating = 0;
      if (menteeMonth) {
        menteeRating = (menteeMonth.thumbsUp / menteeMonth.totalThumbs) * 100;
      }
      if (mentorMonth) {
        mentorRating = (mentorMonth.thumbsUp / mentorMonth.totalThumbs) * 100;
      }
      comparison.push({ month: i, menteeRating, mentorRating });
    }
    return res.status(200).json({ comparison });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
