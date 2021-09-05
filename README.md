# TinyApp Project 

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Purpose

**_BEWARE:_ This app was designed for learning purposes. It is strictly intended for use as an exercise.**

This project was created and published by me as part of my learnings at Lighthouse Labs.


## Final Product

!["Screenshot of TinyApp login"](https://raw.githubusercontent.com/TJ-Blinn/tinyapp/main/docs/TinyApp_Login_screenshot.png)

!["Screenshot of TinyApp homepage"](https://raw.githubusercontent.com/TJ-Blinn/tinyapp/main/docs/TinyApp_homepage_screenshot.png)

!["Screenshot of TinyApp edit"](https://raw.githubusercontent.com/TJ-Blinn/tinyapp/main/docs/TinyApp_Edit_Page_screenshot.png)

!["Screenshot of TinyApp edit"](https://raw.githubusercontent.com/TJ-Blinn/tinyapp/main/docs/TinyApp_Create_TinyURL_Screenshot.png)


## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

| Function Names | Description |
| :---: | :--- |
| urlsForUser | This returns URLs on the /urls page and only displays where userID matches and is confirmed as logged in. Use cURL to confirm that if a user is not logged in, they cannot edit or delete URLs |
| generateRandomString | A function helper to create a 5 character string composed of characters picked randomly for the object in the database containing user information |
| emailCheck |This is an email lookup helper function used in POST /register route to handle to confirm that users are entering a valid email address on registration form |
| generateUserID | A function helper to create a 5 character string composed of characters picked randomly for the userID in the database |