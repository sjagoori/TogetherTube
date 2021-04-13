console.log('player.js running')
let socket = io();

let vidId = document.getElementsByTagName('main')[0].id

/**
 * * Emit a joined event; join a room 
 **/
socket.emit('join', vidId);

/**
 * API related code
 **/
var tag = document.createElement('script');
let playState = false;

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    playerVars: {
      modestbranding: true,
      // autoplay: true,
      showinfo: 0,
      ecver: 2
    },
    height: '390',
    width: '640',
    videoId: vidId,
    origin: 'http://example.com',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
      '*': handleTimestamps
    }
  })
}


/**
* 
* * IFRAME EVENTS
* 
**/


function handleTimestamps(event) {
  socket.emit('state', { id: vidId, playing: true, timestamp: event.target.getCurrentTime(), room: vidId });
}


// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  // event.target.playVideo();
  playState = true
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
function onPlayerStateChange(event) {
  if (event.data == 1 && playState)
    socket.emit('state', { id: vidId, playing: true, timestamp: event.target.getCurrentTime(), room: vidId });
  if (event.data == 2)
    socket.emit('state', { id: vidId, playing: false, timestamp: event.target.getCurrentTime(), room: vidId });
}

function stopVideo() {
  player.stopVideo();
}

function pauseVideo() {
  player.pauseVideo();
}

function startVideo() {
  player.playVideo();
}


/**
 * 
 * * SOCKET.IO EVENTS
 * 
 **/

socket.on('userJoined', () => {
  console.log("USER HAS JOINED")
})

socket.on('onlineCount', count => {
  let counter = document.createElement('p')
  counter.textContent = count + ' users in the room'
  document.getElementsByTagName('h1')[0].appendChild(counter)
})

socket.on('state', state => {
  console.log(state.timestamp)
  console.log(socket)
  // console.dir(player.seekTo(state.timestamp))
})

socket.on('playback', state => {
  state ? startVideo() : pauseVideo()
})
