const express = require('express');
const router = express.Router();
const { scrapeLikesController } = require('../controllers/linkedinController');

router.post('/scrape', scrapeLikesController);

module.exports = router;
