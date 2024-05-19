const { Builder, By, until } = require('selenium-webdriver');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Define the absolute path to the cookies.json file
const cookiesFilePath = path.resolve(__dirname, 'cookies.json');

const scrapeLinkedInLikes = async (req, res) => {
    const url = "https://www.linkedin.com/posts/liane-nguyen-aa40141a8_last-week-i-graduated-from-mays-business-ugcPost-7196179241695105026-jZRB?utm_source=share&utm_medium=member_desktop"; 
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

        const selectors = [
            "//span[contains(@class, 'social-details-social-counts__social-proof-fallback-number')]",
            "//span[contains(@class, 'v-align-middle')]",
            "//span[contains(text(), 'likes')]"
        ];

        let likesSpan;
        for (let selector of selectors) {
            try {
                likesSpan = await driver.findElement(By.xpath(selector));
                if (likesSpan) break;
            } catch (e) {
                continue;
            }
        }

        if (!likesSpan) {
            return res.status(404).send('Likes span not found');
        }

        // Extract the number of likes
        const likesText = await likesSpan.getText();
        const numberOfLikes = parseInt(likesText.replace(/,/g, ''), 10);

        // Scroll the element into view and click it using JavaScript
        await driver.executeScript("arguments[0].scrollIntoView(true);", likesSpan);
        await driver.sleep(1000); // Wait for scrolling to complete
        await driver.executeScript("arguments[0].click();", likesSpan);
        await driver.sleep(5000); // Wait for the likes modal to load

        // Initialize the list of profile URLs
        let profileUrls = new Set(); // Use a Set to avoid duplicates
        let previousHeight = 0; // Initialize previousHeight

        while (profileUrls.size < numberOfLikes) {
            // Extract the profile URLs from the likes modal
            const profileElements = await driver.findElements(By.xpath("//a[contains(@href, '/in/')]"));
            for (const element of profileElements) {
                const url = await element.getAttribute('href');
                if (url.startsWith('https://www.linkedin.com/in/')) {
                    profileUrls.add(url); // Use a Set to handle duplicates
                }
            }

            // Scroll to the bottom of the modal content
            const modalContent = await driver.findElement(By.css('div[class*="social-details-reactors-modal__content"] > div'));
            await driver.executeScript("arguments[0].scrollTo(0, arguments[0].scrollHeight);", modalContent);
            await driver.sleep(2000); // Wait for more profiles to load

            const newHeight = await driver.executeScript("return arguments[0].scrollHeight;", modalContent);
            if (newHeight === previousHeight) {
                break; // Exit the loop if no more content is being loaded
            }
            previousHeight = newHeight;
        }

        const profileUrlsArray = Array.from(profileUrls);
        res.json(profileUrlsArray); // Send the URLs as response
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

