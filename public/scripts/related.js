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
    `<article>
      <a href=${link}>
        <h3>${title}</h3>
        <p>${description.split('\n')[0]}</p>
        <span>${channelTitle}</span>
      </a>
    </article>`
    
    relatedContainer.innerHTML += content
    // relatedContainer.appendChild(new DOMParser().parseFromString(content, 'text/xml').firstChild())
  // console.log(description.split('\n')[0])
  // console.log(channelTitle)
  console.log(thumbnail)
  // console.log(link)
}