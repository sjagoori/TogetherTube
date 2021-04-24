const form = document.getElementsByTagName('form')[1];
const messages = document.getElementsByTagName('ol')[0];
const message = document.getElementById('message')

/**
 * Event handles sent messages
 */
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

/**
 * Function generates message bubbles in chat
 * @param {String} message - message content
 * @param {String} name = user name
 * @param {Number} timestamp - message's timestamp 
 */
function addMessage(message, name, timestamp) {
  if (name == '') name = 'Anon'
  let timeObject = new Date(new Date(timestamp).getTime() - (24 * 60 * 60 * 1000))
  let newMessage = document.createElement('li');

  newMessage.innerText = `${name}: ${message} - ${timeObject.getHours()}:${timeObject.getMinutes()} `;
  newMessage.setAttribute('class', 'newMessage');
  if (name == 'Server') newMessage.setAttribute('type', 'server-message')
  messages.appendChild(newMessage);
}

/**
 * Socket event handles incoming messages
 */
socket.on('message', (emitted) => {
  addMessage(emitted.message, emitted.name, emitted.timestamp);
});

/**
 * Socket event handles messages sent from cache
 */
socket.on('setMessages', (emitted) => {
  emitted.map(key => addMessage(key.message, key.name, key.timestamp))
});

/**
 * Socket event handles join events
 */
socket.on('userJoined', () => {
  console.log("USER HAS JOINED")
  addMessage('Someone has joined the chat', 'Server', +new Date)
})