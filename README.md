# LinkedinBot-backend
linkedin bot that recives a post URL and returns a list linkedin profile URLs for the users that liked the post

## How to run the backend server.

First, install needed npm  dependencies:
```bash
npm install
```
Second, Create a file named .env in the main folder of the project.
```bash
touch .env
```
Fourth, create local environment variable's buy inserting the following:
PORT=8000
LINKEDIN_USERNAME=yourLinkedInUsername
LINKEDIN_PASSWORD=yourLinedInPassword

Fith, run script to save cookies when loging in. MAKE SURE THE "cookies.json" file is in the "controller file" 
```bash
cd ./controllers
node ./saveCookies.js
```
Sixed, run the development server:
```bash
npm start
```

Seventh, input post url in the frontend and watch it break. 

