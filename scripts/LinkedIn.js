const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const cookiesFilePath = path.resolve(__dirname, 'cookies.json');

const scrapeLinkedInLikes = async (url) => {
    if (!url) {
        throw new Error('URL parameter is required');
    }

    let driver = await new Builder().forBrowser('chrome').build();

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

        const reactionButtonSelector = "//li[contains(@class, 'social-details-social-counts__reactions')]//button";
        let reactionButton;
        try {
            reactionButton = await driver.findElement(By.xpath(reactionButtonSelector));
        } catch (e) {
            throw new Error('Reactions button not found');
        }

        await driver.executeScript("arguments[0].scrollIntoView(true);", reactionButton);
        await driver.sleep(1000);
        await driver.executeScript("arguments[0].click();", reactionButton);
        await driver.sleep(5000);

        let profileUrls = new Set();
        let previousHeight = 0;

        while (true) {
            const profileElements = await driver.findElements(By.xpath("//a[contains(@href, '/in/')]"));
            for (const element of profileElements) {
                const url = await element.getAttribute('href');
                if (url.startsWith('https://www.linkedin.com/in/')) {
                    profileUrls.add(url);
                }
            }

            const modalContent = await driver.findElement(By.css('div[class*="social-details-reactors-modal__content"] > div'));
            await driver.executeScript("arguments[0].scrollBy(0, 200);", modalContent);
            await driver.sleep(1000);

            const newHeight = await driver.executeScript("return arguments[0].scrollHeight;", modalContent);
            if (newHeight === previousHeight) {
                break;
            }
            previousHeight = newHeight;
        }

        const profileUrlsArray = Array.from(profileUrls);
        return profileUrlsArray;
    } catch (error) {
        console.error(error);
        throw new Error('An error occurred while scraping the LinkedIn post.');
    } finally {
        await driver.quit();
    }
};

module.exports = {
    scrapeLinkedInLikes
};

