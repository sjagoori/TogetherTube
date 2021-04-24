require("dotenv").config();

const path = require("path");
const port = process.env.PORT || 3000;

const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const http = require("http").createServer(app);
const io = require("socket.io")(http);

const router = require("./routes/router.js");
const eventHandler = require('./modules/ioEvents.js')

io.on("connection", (client) => {
  eventHandler.ioEvents(client, io)
});

app.use(express.static(path.resolve("public")));
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/", router);

http.listen(port, () => {
  console.log(`listening to port ${port}`);
});
