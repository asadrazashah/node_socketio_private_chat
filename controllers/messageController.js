const messageService = require("../services/messageService");

module.exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.query;
    if (conversationId === "") {
      return res.status(400).json({
        error: "no conversation id present",
      });
    }
    const messages = await messageService.getMessagesWithConversationId(
      conversationId
    );
    res.status(200).json({ messages: messages });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports.getMessagesWithConversations = async (req, res) => {
  try {
    const { userId } = req.query;
    const conversations = await messageService.getConversationWithMessages(
      userId
    );
    return res.status(200).json({ conversations: conversations });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports.changeMessagesToRead = async (req, res) => {
  try {
    await messageService.changeMessagesToRead(
      req.body.conversationId,
      req.body.userId
    );
    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.log("called", error);
    res.status(400).json({ error: error.message });
  }
};
