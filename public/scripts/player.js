console.log("player.js running");
let socket = io();
let vidId = document.getElementsByTagName("main")[0].id;
let progressBarController = document.getElementById("progressBarController");
let metaData = document.getElementById("metaData");
let playIcon = `<path d="M12.5 7.134a1 1 0 010 1.732L2 14.928a1 1 0 01-1.5-.866V1.938A1 1 0 012 1.072l10.5 6.062z" fill="#fff"/>`;
let pauseIcon = `<path stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M2.5 13.5v-11M12.5 13.5v-11"/>`;
/**
 * * Emit a joined event; join a room
 **/
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
    },
  });
}

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

let playButton = document
  .getElementById("playButton")
  .addEventListener("click", (e) => {
    if (playState) {
      pauseVideo();
      e.target.innerHTML = playIcon;
    } else if (!playState) {
      startVideo();
      e.target.innerHTML = pauseIcon;
    }
  });

/**
 *
 * * IFRAME EVENTS
 *
 **/
function onPlayerReady(event) {
  handlePlayer();

  let title = document.createElement("span");
  title.textContent = event.target.getVideoData().title;
  metaData.appendChild(title);
  playState = true;
  document.title = event.target.getVideoData().title;
}

function pauseVideo() {
  player.pauseVideo();
  playState = false;
}

function startVideo() {
  player.playVideo();
  playState = true;
}

/**
 *
 * * SOCKET.IO EVENTS
 *
 **/

socket.on("onlineCount", (count) => {
  let counter = document.createElement("span");
  counter.textContent = count;
  document.getElementById("onlineCount").appendChild(counter);
});

socket.on("state", (state) => {
  player.seekTo(state.timestamp);
});

socket.on("playback", (state) => {
  state ? startVideo() : pauseVideo();
});
