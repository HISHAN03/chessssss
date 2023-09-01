const express = require('express');
const path = require('path');
const app = express();
const axios = require('axios');


app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', 'public')


app.get('/', async(req, res) => {
    res.render('game')
});

app.get('/black', async (req, res) => { 
    try {
      const response = await axios.get('http://localhost:8080/api/games');
      const games = response.data;
      if (!games[req.query.code]) {
      return res.redirect('/?error=invalidCode');
      }
      res.render('index', {
        color: 'black',
      });
    } catch (error) {
      console.error('Error fetching games:', error);
    
    }
  });

app.get('/white', async(req, res) => {
    res.render('index',{
        color: 'white'
    })
});

app.listen(3000, () => {
    console.log("Server successfully running on port 3000");
  });