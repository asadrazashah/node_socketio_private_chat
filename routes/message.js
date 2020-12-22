const router = require("express").Router();
const messageController = require("../controllers/messageController");

router.route("/").get(messageController.getMessages);
router
  .route("/conversations")
  .get(messageController.getMessagesWithConversations);
router.route("/change-status").post(messageController.changeMessagesToRead);
module.exports = router;
