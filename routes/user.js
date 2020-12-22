const router = require("express").Router();
const userController = require("../controllers/userController");

router.route("/signup").post(userController.registerUser);
router.route("/signin").post(userController.login);
router.route("/forgot-password").post(userController.forgetPassword);
router.route("/all").get(userController.getAllUsersByType);
router.route("/profile/:id").get(userController.getUserProfile);
router.route("/profile/update/:id").patch(userController.updateUserProfile);
router.route("/assign-mentor").post(userController.assignMentorToMentee);
router.route("/remove-mentor").post(userController.removeMentorFromMentee);
router.route("/conversations").get(userController.getUserConversations);
router.route("/conversations/all").get(userController.getAllUserConversations);
router.route("/unpair/reason").post(userController.mentorChangeReason);
router
  .route("/find-conversation-with-details")
  .get(userController.findConversationWithDetails);
router
  .route("/conversation-stats")
  .get(userController.findStatsForConversationByMonth);
router.route("/edit").post(userController.editUser);
router.route("/edit-matched-user").post(userController.editAlreadyMatchedUsers);
router
  .route("/conversations/comments")
  .get(userController.getConversationCommentsByMonth);
router
  .route("/conversations/ongoing")
  .get(userController.getOngoingConversations);
module.exports = router;
