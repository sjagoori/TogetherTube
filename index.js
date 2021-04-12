const express = require('express');
const app = express();
const http = require('http').createServer(app);
const path = require('path');
const io = require('socket.io')(http);
const axios = require('axios')
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
  })

  socket.on('state', (emitted) => {
    console.log('state', emitted)
    io.to(emitted.room).emit('state', emitted);

    emitted.playing ? io.to(emitted.room).emit('playback', true) : io.to(emitted.room).emit('playback', false) 
    // send status to room 
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