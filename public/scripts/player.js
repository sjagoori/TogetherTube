console.log("player.js running");
let socket = io();
let vidId = document.getElementsByTagName("main")[0].id;
let progressBarController = document.getElementById("progressBarController");
let metaData = document.getElementById("metaData");
let playButton = document
  .getElementById("playButton")
  .addEventListener("click", handlePlayButton);
let playIcon = `<path d="M12.5 7.134a1 1 0 010 1.732L2 14.928a1 1 0 01-1.5-.866V1.938A1 1 0 012 1.072l10.5 6.062z" fill="#fff"/>`;
let pauseIcon = `<path stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M2.5 13.5v-11M12.5 13.5v-11"/>`;
let videoTitle;

socket.emit("join", vidId);

/**
 * API related code
 **/
var tag = document.createElement("script");
let playState = false;

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;

function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    playerVars: {
      modestbranding: 1,
      controls: 0,
      allowfullscreen: 1,
      fs: 1,
      autoplay: true,
      showinfo: 0,
    },
    height: "390",
    width: "640",
    videoId: vidId,
    origin: "http://example.com",
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}

/**
 * Function monitors the player's play state and handles seek events
 */
function handlePlayer() {
  setInterval(function () {
    let position = (player.getCurrentTime() / player.getDuration()) * 100;
    document.getElementById("progressBar").addEventListener("click", (e) => {
      let seekTo = (e.offsetX / e.target.offsetWidth) * player.getDuration();
      player.seekTo(seekTo);
      socket.emit("state", {
        id: vidId,
        playing: true,
        timestamp: seekTo,
        room: vidId,
      });
    });
    progressBarController.style.left = position + "%";
  }, 200);
}

/**
 * Function handles playButton events and player's playback state
 * @param {Event} e - event
 */
function handlePlayButton(e) {
  if (playState) {
    pauseVideo();
    e.target.innerHTML = playIcon;
  } else if (!playState) {
    startVideo();
    e.target.innerHTML = pauseIcon;
  }
}
/**
 *
 * * IFRAME EVENTS
 *
 **/

/**
 * Function handles onReady event
 * @param {Event} event - event
 */
function onPlayerReady(event) {
  handlePlayer();
  playState = true;

  let title = document.createElement("span");
  videoTitle = event.target.getVideoData().title;
  title.textContent = videoTitle;
  metaData.appendChild(title);

  document.title = videoTitle;
  socket.emit("setMetaData", {
    title: videoTitle,
    duration: player.getDuration(),
    room: vidId,
  });
}

/**
 * Function handles interaction with iFrame player
 * @param {Event} event - event
 */
function onPlayerStateChange(event) {
  switch (event.data) {
    case 1:
      startVideo();
      playState = true;
      socket.emit("playback", { room: vidId, state: playState });
      break;
    case 2:
      pauseVideo();
      playState = false;
      socket.emit("playback", { room: vidId, state: false });
      break;
  }
}

/**
 * Function pauses player
 */
function pauseVideo() {
  player.pauseVideo();
}

/**
 * Function starts player
 */
function startVideo() {
  player.playVideo();
}

/**
 *
 * * SOCKET.IO EVENTS
 *
 **/

/**
 * Socket event handles online count and renders it on the DOM
 */
socket.on("onlineCount", (count) => {
  let counter = document.createElement("span");
  counter.textContent = count;
  document.getElementById("onlineCount").appendChild(counter);
});

/**
 * Socket event handles seek event
 */
socket.on("state", (state) => {
  player.seekTo(state.timestamp);
});

/**
 * Socket event handles playback state
 */
socket.on("playback", (state) => {
  console.log(state);
  state ? startVideo() : pauseVideo();
});
