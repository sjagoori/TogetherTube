require("dotenv").config();

const path = require("path");
const port = process.env.PORT || 3000;

const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const axios = require("axios");
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const messageCache = require("./modules/messageCache.js");
const relatedCache = require("./modules/relatedCache.js");
const router = require("./routes/router.js");

/**
 * * Socket.io config
 */
io.on("connection", (socket) => {
  socket.on("join", (room) => {
    socket.join(room);
    socket.broadcast.to(room).emit("userJoined");

    if (io.sockets.adapter.rooms.get(room))
      socket.emit("onlineCount", io.sockets.adapter.rooms.get(room).size);
    if (messageCache.getCache(room) == undefined)
      messageCache.setCache(room, []);
  });

  socket.on("state", (emitted) => {
    io.to(emitted.room).emit("state", emitted);

    emitted.playing
      ? io.to(emitted.room).emit("playback", true)
      : io.to(emitted.room).emit("playback", false);
  });

  socket.on("message", (message) => {
    console.dir(message);
    let cache = messageCache.getCache(message.room);
    cache.push(message);
    messageCache.setCache(message.room, cache);
    socket.broadcast.to(message.room).emit("message", message);
  });

  socket.on("getMessages", (room) => {
    let cache = messageCache.getCache(room);
    let renderData = Object.values(cache)
      .map((key) =>
        +new Date() - key.timestamp < 3600000 && key.room == room ? key : false
      )
      .filter((elem) => typeof elem == "object");

    io.to(room).emit("setMessages", renderData);
  });

  socket.on("getRelated", async (room) => {
    let callString = `https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${room}&type=video&key=${process.env.API_KEY}`;

    if ((await relatedCache.getCache(room)) == null) {
      await relatedCache.setCache(
        room,
        JSON.stringify([await axios.get(callString).then((res) => res.data)])
      );
      await io
        .to(room)
        .emit("setRelated", JSON.parse(await relatedCache.getCache(room))[0]);
    } else {
      io.to(room).emit(
        "setRelated",
        JSON.parse(await relatedCache.getCache(room))[0]
      );
    }
  });
});

/**
 * * Server config
 */

app.use(express.static(path.resolve("public")));

app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/", router);

http.listen(port, () => {
  console.log(`listening to port ${port}`);
});
