const express = require('express');
const router = express.Router();

const {scrapeLinkedInLikes} = require ('../controllers/LinkedIn.js');

// api/linked
router.get('/linked', scrapeLinkedInLikes);
router.post('/linkedin', scrapeLinkedInLikes);

module.exports = router;
