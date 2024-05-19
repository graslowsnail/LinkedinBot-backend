const { Builder, By, until } = require('selenium-webdriver');
const fs = require('fs');
require('dotenv').config();
const path = require('path');

const saveCookies = async () => {
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        // Login to LinkedIn
        await driver.get('https://www.linkedin.com/login');
        await driver.findElement(By.id('username')).sendKeys(process.env.LINKEDIN_USERNAME);
        await driver.findElement(By.id('password')).sendKeys(process.env.LINKEDIN_PASSWORD);
        await driver.findElement(By.xpath("//button[contains(text(), 'Sign in')]")).click();
        await driver.wait(until.urlContains('feed'), 10000);

        // Save cookies to a file
        let cookies = await driver.manage().getCookies();
        const filePath = path.join(__dirname, 'cookies.json');
        fs.writeFileSync(filePath, JSON.stringify(cookies));
        console.log('Cookies saved successfully at', filePath);
    } finally {
        await driver.quit();
    }
};

saveCookies();

