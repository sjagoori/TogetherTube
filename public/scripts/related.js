console.log('related.js running')

const relatedContainer = document.getElementsByTagName('section')[0].children[1]

socket.emit('getRelated', vidId)

socket.on('setRelated', (emitted) => {
  emitted.items.map(key => generateCards(key.snippet.title, key.snippet.description, key.snippet.channelTitle, key.snippet.thumbnails, key.id.videoId))
})

function generateCards(title, description, channelTitle, thumbnail, link) {
  // let a = document.createElement('p')
  // a.textContent = title
  // relatedContainer.appendChild(a)

  let content =
    `
    <a href=${link}>
    <article>
    <figure>
      <div class="gradient">
        <img srcset=
          ${thumbnail.maxres.url}  1280w,
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
  // relatedContainer.appendChild(new DOMParser().parseFromString(content, 'text/xml').firstChild())
  // console.log(description.split('\n')[0])
  // console.log(channelTitle)
  console.log(thumbnail)
  // console.log(link)
}

socket.emit('getRelated', vidId)
