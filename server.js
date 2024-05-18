// npm start to run with nodemon
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// routes 
const linkedIn= require('./routes/linkedInRoutes.js');

// express app
const app = express();
app.use(cors());

// EXAMPLE: this is how a api call will be made to a api 
app.use('/api', linkedIn );

// to stop deprecation warning in console
//mongoose.set('strictQuery', false);

/* connect to mongoDb 
mongoose.connect(
    process.env.MONGO_URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology:true,
    }
);
*/

// this logs the mongoDb queries being executed
//mongoose.set('debug', true);

app.listen(process.env.PORT, () => {
    console.log(' connected to Bet Checker backend 🌎');
    console.log(' listening on port', process.env.PORT + '🗿  🚀')
})


