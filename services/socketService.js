const messageService = require("./messageService");
const CONSTANTS = require("../config/constants");
const moment = require("moment-timezone");
const analyticsService = require("./analyticsService");

module.exports.executeSocketService = (socketio) => {
  const io = socketio;
  io.on("connection", (client) => {
    //add socket id to user
    let beginTime = moment();
    let endTime = null;
    client.on("join", async (queryObj) => {
      if (queryObj) {
        client.join(queryObj);
      } else {
        io.to(client.id).emit("join-failure", {
          error: true,
          message: "failed to join conversation",
        });
      }
    });
    client.on("message", async (message) => {
      if (message.conversationId) {
        client.broadcast
          .to(message.conversationId)
          .emit("message-response", message);
        await messageService.insertMessage(message);
      } else {
        io.to(client.id).emit("message-failure", {
          error: true,
          message: "failed to send message",
        });
      }
    });
    client.on("leave-all", () => {
      client.leaveAll();
    });

    client.on("leave-room", async (data) => {
      try {
        const userId = data.userId;
        await messageService.logout(userId);
        io.to(client.id).emit(`logout-response`, {
          error: false,
          message: CONSTANTS.USER_LOGGED_OUT,
          userId: userId,
        });

        client.broadcast.emit(`chat-list-response`, {
          error: false,
          userDisconnected: true,
          userid: userId,
        });
      } catch (error) {
        console.log(error);
        io.to(client.id).emit(`logout-response`, {
          error: true,
          message: CONSTANTS.SERVER_ERROR_MESSAGE,
          userId: userId,
        });
      }
    });
    client.once("disconnect", function () {
      endTime = moment();
      let diff = endTime.diff(beginTime, "minutes");
      if (diff > 0) {
        analyticsService.incrementTimeSpentByUser(diff);
      }
    });
  });
};
