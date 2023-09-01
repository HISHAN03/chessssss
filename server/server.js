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

app.get('/api/games', (req, res) => {
  console.log('url hit')
  
  res.json(games);
});

io.on('connection', socket => {
  console.log('New socket connection');

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

  socket.on('disconnect', function() {
      console.log('socket disconnected');

      if (currentCode) {
          io.to(currentCode).emit('gameOverDisconnect');
          delete games[currentCode];
      }
  });

});









http.listen(port, () => {
    console.log("Server Is Running Port: " + port);
});