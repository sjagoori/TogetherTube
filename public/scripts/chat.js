const form = document.getElementsByTagName('form')[0];
const messages = document.getElementsByTagName('ol')[0];

socket.emit('getMessages', vidId)

console.log(form)


form.addEventListener('submit', (e) => {
  e.preventDefault();

  let name = e.target[1].value
  let message = e.target[2].value
  let timestamp = +new Date

  if (message != '') {
    socket.emit('message', { name: name, message: message, timestamp: timestamp, room: vidId });
    document.forms[0][2].value = '';
    return true;
  }
});

socket.on('message', (emitted) => {
  addMessage(emitted.message, emitted.name, emitted.timestamp);
});

socket.on('setMessages', (emitted) => {
  emitted.map(key => addMessage(key.message, key.name, key.timestamp))
});

function addMessage(message, name, timestamp) {
  console.log(timestamp)
  let timeObject = new Date(new Date(timestamp).getTime() - (24 * 60 * 60 * 1000))
  let newMessage = document.createElement('li');
  console.log(message, name)
  newMessage.innerText = `${name}: ${message} - ${timeObject.getHours()}:${timeObject.getMinutes()} `;
  newMessage.setAttribute('class', 'newMessage');
  messages.appendChild(newMessage);
  newMessage.scrollIntoView(true);
  setTimeout(function () {
    newMessage.removeAttribute('class', 'newMessage');
  }, 1500);
}