const express = require("express");
const app = express();
const port = 8080;
const http = require("http").createServer(app);


const io = require("socket.io")(http,{
  cors:
  {
    origin:`http://localhost:3000`
  }

});
games = {};
//const chatMessages1 = [];

app.get('/api/games', (req, res) => {
  console.log('url hit')
  
  res.json(games);
});

io.on('connection', socket => {
  console.log('New socket connection');

  socket.on('newMessage', (message) => {
    console.log(`Received message: ${message.text}`);
    io.to(currentCode).emit('chatMessage', message);
   
  });


  let currentCode = null; 

  socket.on('move', function(move) {
      console.log('move detected')

      io.to(currentCode).emit('newMove', move);
  });
  
  socket.on('joinGame', function(data) {

      currentCode = data.code;
      socket.join(currentCode);
      if (!games[currentCode]) {
          games[currentCode] = true;
          return;
      }
      
      io.to(currentCode).emit('startGame');
  });


  

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
  

  socket.on('disconnect', function() {
      console.log('socket disconnected');

      if (currentCode) {
          io.to(currentCode).emit('gameOverDisconnect');
          delete games[currentCode];
      }
  });

  socket.on('reconnect', () => {
    console.log('Socket reconnected');
  });

});









http.listen(port, () => {
    console.log("Server Is Running Port: " + port);
});