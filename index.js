const express = require('express');
const app = express();
const http = require('http').createServer(app);
const path = require('path');
const io = require('socket.io')(http);
const messageCache = require("./modules/messageCache.js");
const bodyParser = require('body-parser');
const router = require('./routes/router.js')
const port = process.env.PORT || 3000;


/**
 * * Socket.io config
 */
io.on('connection', (socket) => {
  console.log('user connected');
  io.emit('userJoined');

  socket.on('join', async (room) => {
    console.log('joining: ', room)
    socket.join(room)
    io.to(room).emit('userJoined');

    if (io.sockets.adapter.rooms.get(room)) socket.emit('onlineCount', io.sockets.adapter.rooms.get(room).size)

    let cache = messageCache.getCache(room)
    if (cache == undefined) messageCache.setCache(room, [])
  })

  socket.on('state', (emitted) => {
    console.log('state', emitted)
    io.to(emitted.room).emit('state', emitted);

    emitted.playing ? io.to(emitted.room).emit('playback', true) : io.to(emitted.room).emit('playback', false)
  })

  socket.on('message', (message) => {
    console.dir(message)
    let cache = messageCache.getCache(message.room)

    messageCache.setCache(message.room, cache)
    socket.broadcast.to(message.room).emit('message', message)
  })

  socket.on('getMessages', (room) => {
    let cache = messageCache.getCache(room)
    let now = +new Date
    let renderData = Object.values(cache).map(key => (now - key.timestamp) < 3600000 && key.room == room ? key : false).filter(elem => typeof elem == 'object')
    io.to(room).emit('setMessages', renderData)
  })

  socket.on('disconnect', () => {
    console.log('disconnected');
  });
});


/**
 * * Server config
 */

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', router)

//fallback?
app.use(express.static(path.resolve('public')));



http.listen(port, () => {
  console.log(`listening to port ${port}`);
});