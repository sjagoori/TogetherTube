console.log('related.js running')

const relatedContainer = document.getElementsByTagName('section')[0].children[1]

/**
 * Function handles related-videos
 */
socket.on('setRelated', (emitted) => {
  if (relatedContainer.children.length == 0) emitted[0].items.map(key => {
    if (key.snippet != undefined) {
      generateCards(
        key.snippet.title,
        key.snippet.channelTitle,
        key.snippet.thumbnails,
        key.id.videoId
      )
    }
  })
})

/**
 * Function generates cards
 * @param {String} title - video title
 * @param {String} channelTitle - channel title
 * @param {Object} thumbnail - object of thumbnail sources
 * @param {String} link - link to video
 */
function generateCards(title, channelTitle, thumbnail, link) {
  let content =
    `
    <a href=${link}>
    <article>
    <figure>
      <div class="gradient">
        <img srcset=
          ${thumbnail.maxres != undefined ? thumbnail.maxres.url : thumbnail.high.url}  1280w,
          ${thumbnail.standard.url} 640w,
          ${thumbnail.high.url} 480w,
          ${thumbnail.medium.url}  320w 
          ${thumbnail.default.url}  120w 
          sizes="(min-width: 36em) 33.3vw,100vw" 
          src=${thumbnail.standard.url} 
          alt="thumbnail"
          loading="lazy" 
        />
      </div>
      <figcaption>${title}<span>${channelTitle}</span></figcaption>
    </figure>
  </article>
  </a>
  `

  relatedContainer.innerHTML += content
}
