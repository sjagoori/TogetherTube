console.log("homepage.js running");
let socket = io();
const streamsContainer = document.getElementsByTagName("section")[0];
socket.emit("getCurrentStreams");
const form = document.forms[0];
form.addEventListener("submit", handleSubmit);

function handleSubmit(e) {
  e.preventDefault();

  let prep = e.target[1].value.match(
    /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/
  );

  return prep ? form.submit() : (e.target[0].style.color = "red");
}

socket.on("setCurrentStreams", (emitted) => {
  let streams = emitted;

  console.log(streams);
  Object.values(streamsContainer.children).map((key) =>
    key.localName == "a" ? key.remove() : null
  );

  if (Object.keys(streams).length > 0) {
    streamsContainer.children[0].style.display = "block";
    Object.values(streams).map((key) => {
      generateCards(key.title, key.room, key.thumbnails, key.memberCount);
    });
  }
});

function generateCards(title, room, thumbnail, memberCount) {
  let content = `
    <a href=/video/${room}>
    <article>
    <figure>
      <div class="gradient">
        <img srcset=
          ${thumbnail.maxres}  1280w,
          ${thumbnail.hqdefault} 640w,
          ${thumbnail.standard} 480w,
          ${thumbnail.medium}  320w 
          ${thumbnail.default}  120w 
          sizes="(min-width: 36em) 33.3vw,100vw" 
          src=${thumbnail.standard} 
          alt="thumbnail"
          loading="lazy" 
        />
      </div>
      <figcaption>${title}
        <div id="onlineCount">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path
              d="M12 6a9.77 9.77 0 018.82 5.5C19.17 14.87 15.79 17 12 17s-7.17-2.13-8.82-5.5A9.77 9.77 0 0112 6m0-2C7 4 2.73 7.11 1 11.5 2.73 15.89 7 19 12 19s9.27-3.11 11-7.5C21.27 7.11 17 4 12 4zm0 5a2.5 2.5 0 010 5 2.5 2.5 0 010-5m0-2c-2.48 0-4.5 2.02-4.5 4.5S9.52 16 12 16s4.5-2.02 4.5-4.5S14.48 7 12 7z" />
          </svg>
          ${memberCount}
        </div>
      </figcaption>
    </figure>
  </article>
  </a>
  `;

  streamsContainer.innerHTML += content;
}
