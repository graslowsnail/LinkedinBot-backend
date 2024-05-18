const express = require('express');
const router = express.Router();

const {scrapeLinkedInLikes} = require ('../controllers/LinkedIn.js');

// api/linked
router.get('/linked', scrapeLinkedInLikes);

module.exports = router;
