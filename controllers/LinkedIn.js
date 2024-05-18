const { Builder, By, until } = require('selenium-webdriver');
require('dotenv').config();

const scrapeLinkedInLikes = async (req, res) => {
    const url = "https://www.linkedin.com/posts/jacob-a-morgan-2023_im-proud-to-have-presented-my-masters-thesis-activity-7197061672455290881-5Dn1?utm_source=share&utm_medium=member_desktop"; // Hardcoded URL for testing
    if (!url) {
        return res.status(400).send('URL parameter is required');
    }

    let driver = await new Builder().forBrowser('chrome').build();

    try {
        // Login to LinkedIn
        await driver.get('https://www.linkedin.com/login');
        await driver.findElement(By.id('username')).sendKeys(process.env.LINKEDIN_USERNAME);
        await driver.findElement(By.id('password')).sendKeys(process.env.LINKEDIN_PASSWORD);
        await driver.findElement(By.xpath("//button[contains(text(), 'Sign in')]")).click();
        await driver.wait(until.urlContains('feed'), 10000);

        // Navigate to the LinkedIn post
        await driver.get(url);
        await driver.sleep(5000); // Wait for the post to load

        // Find the span element containing the number of likes (without hardcoding the number)
        const likesSpan = await driver.findElement(By.xpath("//span[contains(@class, 'social-details-social-counts__social-proof-fallback-number')]"));
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

        // Scroll through the modal to load all profile URLs
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

            // Check if the height of the modal content has changed
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

