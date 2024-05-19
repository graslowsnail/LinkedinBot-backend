const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const cookiesFilePath = path.resolve(__dirname, 'cookies.json');

const scrapeLinkedInLikes = async (req, res) => {
    const { url } = req.body;  // Extract URL from request body
    if (!url) {
        return res.status(400).send('URL parameter is required');
    }

    let driver = await new Builder().forBrowser('chrome').build();

    // Function to load cookies
    const loadCookies = async (driver) => {
        const cookies = JSON.parse(fs.readFileSync(cookiesFilePath, 'utf8'));
        for (let cookie of cookies) {
            await driver.manage().addCookie(cookie);
        }
    };

    try {
        await driver.get('https://www.linkedin.com/');
        await loadCookies(driver);
        await driver.navigate().refresh();
        await driver.wait(until.urlContains('feed'), 10000);

        await driver.get(url);
        await driver.sleep(5000);

        // Refined selector to target the <li> element with the class 'social-details-social-counts__reactions'
        const reactionButtonSelector = "//li[contains(@class, 'social-details-social-counts__reactions')]//button";

        let reactionButton;
        try {
            reactionButton = await driver.findElement(By.xpath(reactionButtonSelector));
        } catch (e) {
            return res.status(404).send('Reactions button not found');
        }

        // Scroll the element into view and click it using JavaScript
        await driver.executeScript("arguments[0].scrollIntoView(true);", reactionButton);
        await driver.sleep(1000); // Wait for scrolling to complete
        await driver.executeScript("arguments[0].click();", reactionButton);
        await driver.sleep(5000); // Wait for the likes modal to load

        // Initialize the list of profile URLs
        let profileUrls = new Set(); // Use a Set to avoid duplicates
        let previousHeight = 0; // Initialize previousHeight

        while (true) {
            // Extract the profile URLs from the likes modal
            const profileElements = await driver.findElements(By.xpath("//a[contains(@href, '/in/')]"));
            for (const element of profileElements) {
                const url = await element.getAttribute('href');
                if (url.startsWith('https://www.linkedin.com/in/')) {
                    profileUrls.add(url);
                }
            }

            // Scroll to the bottom of the modal content
            const modalContent = await driver.findElement(By.css('div[class*="social-details-reactors-modal__content"] > div'));
            await driver.executeScript("arguments[0].scrollBy(0, 200);", modalContent);
            await driver.sleep(1000); // Wait for more profiles to load

            const newHeight = await driver.executeScript("return arguments[0].scrollHeight;", modalContent);
            if (newHeight === previousHeight) {
                break; // Exit the loop if no more content is being loaded
            }
            previousHeight = newHeight;
        }

        const profileUrlsArray = Array.from(profileUrls);
        res.json(profileUrlsArray);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while scraping the LinkedIn post.');
    } finally {
        await driver.quit();
    }
};

module.exports = {
    scrapeLinkedInLikes
};

