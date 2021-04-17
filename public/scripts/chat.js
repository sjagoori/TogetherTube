const form = document.getElementsByTagName('form')[1];
const messages = document.getElementsByTagName('ol')[0];
const message = document.getElementById('message')

socket.emit('getMessages', vidId)

console.log(form)


form.addEventListener('submit', (e) => {
  e.preventDefault();

  let name = e.target[1].value
  let messageContent = e.target[2].value
  let timestamp = +new Date

  if (messageContent != '') {
    socket.emit('message', { name: name, message: messageContent, timestamp: timestamp, room: vidId });
    addMessage(messageContent, name, timestamp)
    message.value = '';
  }
});

socket.on('message', (emitted) => {
  addMessage(emitted.message, emitted.name, emitted.timestamp);
});

socket.on('setMessages', (emitted) => {
  emitted.map(key => addMessage(key.message, key.name, key.timestamp))
});

socket.on('userJoined', () => {
  console.log("USER HAS JOINED")
  addMessage('Someone has joined the chat', 'Server', +new Date)
})

function addMessage(message, name, timestamp) {
  if (name == '') name = 'Anon'
  let timeObject = new Date(new Date(timestamp).getTime() - (24 * 60 * 60 * 1000))
  let newMessage = document.createElement('li');

  newMessage.innerText = `${name}: ${message} - ${timeObject.getHours()}:${timeObject.getMinutes()} `;
  newMessage.setAttribute('class', 'newMessage');
  if (name == 'Server') newMessage.setAttribute('type', 'server-message')
  messages.appendChild(newMessage);

  newMessage.scrollIntoView(true);
  setTimeout(function () {
    newMessage.removeAttribute('class', 'newMessage');
  }, 1500);
}