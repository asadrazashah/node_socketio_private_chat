const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const fileUpload = require("express-fileupload");
const { executeSocketService } = require("./services/socketService");
const mongoose = require("mongoose");
const cors = require("cors");
const user = require("./routes/user");
const messages = require("./routes/message");
const information = require("./routes/information");
const analytics = require("./routes/analytics");
require("dotenv").config();
app = express();

const port = process.env.PORT || 3008;

mongoose.connect(
  `${process.env.MONGOO_DB}`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: false,
    useFindAndModify: false,
  },
  () => {
    console.log("connected to db");
  }
);

app.use(cors());
app.use(express.json());
app.use(
  fileUpload({ useTempFiles: true, tempFileDir: path.join(__dirname, "temp") })
);

app.use("/user", user);
app.use("/information", information);
app.use("/messages", messages);
app.use("/analytics", analytics);

app.get("/", (req, res) => {
  res.send("server up");
});

const server = app.listen(port, () =>
  console.log(`Server running on port ${port}.`)
);

const socket = socketio(server);
executeSocketService(socket);
