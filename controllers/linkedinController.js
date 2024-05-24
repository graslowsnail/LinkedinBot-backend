const { scrapeLinkedInLikes } = require('../scripts/LinkedIn');
const fs = require('fs');
const path = require('path');

const scrapeLikesController = async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).send('URL parameter is required');
    }

    try {
        const profileUrls = await scrapeLinkedInLikes(url);
        const csvContent = profileUrls.join('\n');
        const filePath = path.join(__dirname, '../public/profile_urls.csv');
        fs.writeFileSync(filePath, csvContent);
        res.download(filePath, 'profile_urls.csv');
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while scraping the LinkedIn post.');
    }
};

module.exports = {
    scrapeLikesController
};

