let socket = io("http://localhost:8080");
let gameOver = false;
let gameHasStarted = false;



const messageForm = document.querySelector('#message-form');
messageForm.addEventListener('submit', (event) => {
  console.log("sending")
  event.preventDefault();
  const messageInput = document.querySelector('#message-input');
  console.log(messageInput)
  const message = {
    text: messageInput.value
  };
  socket.emit('newMessage', message);
  messageInput.value = '';
  //displayMessage({ username: 'You', text: message.text });
});

socket.on('chatMessage', (message) => {
  
  console.log(`Received message: ${message.text}`);
  
  // Send the message to other users
  displayMessage(message);

});


// socket.on('nMessage', (message) => {

//   const messagesList = document.querySelector('#messages-list');

//   const messageItem = document.createElement('li');

//   messageItem.textContent = ` ${message.text}`;

//   messagesList.appendChild(messageItem);

// });
function displayMessage(message) {
  const messageContainer = document.querySelector('#message-container');

  const messageElement = document.createElement('div');
  
  messageElement.classList.add('message');
  
  messageElement.innerHTML = `<span class="username">${message.username}: </span>${message.text}`;
  
  messageContainer.appendChild(messageElement);
}


// function sendMessage() {
//   try {
//     const messageInput = document.getElementById('messageInput');
//     const message = messageInput.value;
//     io.emit('sendMessage', message);
//     messageInput.value = '';
//     displayMessage('You', message);
//   } catch (error) {
//     console.error('Error sending message:', error);
//     // Handle the error appropriately, e.g., logging, displaying an error message, etc.
//   }
// }



socket.on("welcome", (data) => {
   console.log("Message: ", data);
});
var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
}
board = Chessboard('myBoard', config)
var board = null
var game = new Chess()
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')

function onDragStart (source, piece, position, orientation) {
  
  // do not pick up pieces if the game is over
  if (game.game_over()) return false
  if (!gameHasStarted) return false;
  if (gameOver) return false;
  
  if ((playerColor === 'black' && piece.search(/^w/) !== -1) || (playerColor === 'white' && piece.search(/^b/) !== -1)) {
    return false;
}
  // only pick up pieces for the side to move
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
  }
}
socket.on('newMessage', (message) => {
  
  console.log(`Received message: ${message.text}`);
  
  // Update the UI with the new message
  displayMessage(message);
});

function displayMessage(message) {
  const messageContainer = document.querySelector('#message-container');

  const messageElement = document.createElement('div');
  
  messageElement.classList.add('message');
  
  messageElement.innerHTML = `${message.text}`;
  
  messageContainer.appendChild(messageElement);
}







function onDrop (source, target) {
  let theMove = {
      from: source,
      to: target,
      promotion: 'q' // NOTE: always promote to a queen for simplicity
  };
  // see if the move is legal
  var move = game.move(theMove);


  // illegal move
  if (move === null) return 'snapback'

  socket.emit('move', theMove);

  updateStatus()
}

socket.on('newMove', function(move) {
  game.move(move);
  board.position(game.fen());
  updateStatus();
});

socket.on('newMove',function(move)
{
  game.move(move)
})
// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen())
}

function updateStatus () {
  var status = ''

  var moveColor = 'White'
  if (game.turn() === 'b') {
      moveColor = 'Black'
  }

  // checkmate?
  if (game.in_checkmate()) {
      status = 'Game over, ' + moveColor + ' is in checkmate.'
  }

  // draw?
  else if (game.in_draw()) {
      status = 'Game over, drawn position'
  }

  else if (gameOver) {
      status = 'Opponent disconnected, you win!'
  }

  else if (!gameHasStarted) {
      status = 'Waiting for black to join'
  }

  // game still on
  else {
      status = moveColor + ' to move'

      // check?
      if (game.in_check()) {
          status += ', ' + moveColor + ' is in check'
      }
      
  }

  $status.html(status)
  $pgn.html(game.pgn())
}


var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
}
board = Chessboard('myBoard', config)
if (playerColor == 'black') {
    board.flip();
}

updateStatus()

var urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('code')) {
    socket.emit('joinGame', {
        code: urlParams.get('code')
    });
}

socket.on('startGame', function() {
    gameHasStarted = true;
    updateStatus()
});

socket.on('gameOverDisconnect', function() {
    gameOver = true;
    updateStatus()
});