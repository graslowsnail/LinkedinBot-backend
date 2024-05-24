// npm start to run with nodemon
require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const linkedIn = require('./routes/linkedInRoutes.js');

// routes 

// express app
const app = express();
app.use(cors());
app.use(express.json()); // Add this line to parse JSON request bodies
app.use(express.static('public'));

// EXAMPLE: this is how a api call will be made to a api 
app.use('/api', linkedIn );

app.listen(process.env.PORT, () => {
    console.log(' connected to Bet Checker backend 🌎');
    console.log(' listening on port', process.env.PORT + '🗿  🚀')
})


