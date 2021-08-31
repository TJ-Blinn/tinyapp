const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const app = express();
const PORT = 8080; // default port 8080

// set the view engine to ejs
app.set("view engine", "ejs");

// middleware cookie-parser 1st, Body-parser
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// Users Object users.userRandomID = userRandomID;
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};
// -------------------------------
// index page
app.get("/", function (req, res) {
  const mascots = [
    { name: "Sammy", organization: "DigitalOcean", birth_year: 2012 },
    { name: "Tux", organization: "Linux", birth_year: 1996 },
    { name: "Moby Dock", organization: "Docker", birth_year: 2013 },
  ];
  const tagline = "No programming concept is complete without a cute animal mascot.";

  res.render("pages/index", {
    // res.render() will look in a views folder for the view.
    mascots: mascots,
    tagline: tagline,
  });
});

// about page
app.get("/about", function (req, res) {
  res.render("pages/about");
});
// -------------------------------

// route handler for urls/new - GET Route for form + cookies
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_new", templateVars);
});

// route handler for /urls + cookies
app.get("/urls", (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// route handler for /urls_show + cookies
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  // Use the shortURL from the route parameter to lookup it's associated longURL from the urlDatabase

  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// /urls.json - another page - routing for urlDatabase object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// /hello - another page - routing with HTML
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// POST request
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let randoURL = generateRandomString(5);

  urlDatabase[randoURL] = req.body.longURL; // when long url is entered on website, is received req.body.longURL; (url_new page === name)
  res.redirect("/urls");
});

// 5 character string composed of characters picked randomly for shortURL
const generateRandomString = function (length) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

// requests to the endpoint "/u/:shortURL" will redirect to its longURL
app.get("/u/:shortURL", (req, res) => {
  console.log(req.params);
  if (urlDatabase[req.params.shortURL]) {
    let fullURL = urlDatabase[req.params.shortURL];

    res.redirect(fullURL);
    //res.redirect(longURL);
  } else {
    res.status(404).send("shortURL does not exist"); // NOT Found adds 404 to res, then chains to send message to browser
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // console.log(req.body);
  if (urlDatabase[req.params.shortURL]) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});

// The edit function reassigns(updates) the longURL
app.post("/urls/:shortURL/update", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;

  res.redirect("/urls");
});

// The login route // cookies that have not been signed. POST -> sending to server (form with username)
app.post("/urls/login", (req, res) => {
  const username = req.body.username; // assigning what's coming from form into a variable (body == every input field)

  res.cookie("username", username);
  // req,body comes from values in form - NOT cookie. This is what sets the cookie.

  res.redirect("/urls");
});

// The logout route
app.post("/urls/logout", (req, res) => {
  res.clearCookie("username"); // clear cookies (username) then redirect

  res.redirect("/urls");
});

// register endpoint
app.get("/register", (req, res) => {
  res.render("pages/registration", { username: undefined });
});

// Users Object
// const users = {
//   "userRandomID": {
//     id: "userRandomID",
//     email: "user@example.com",
//     password: "purple-monkey-dinosaur"
//   },
//  "user2RandomID": {
//     id: "user2RandomID",
//     email: "user2@example.com",
//     password: "dishwasher-funk"
//   }
// }
// POST request ----------------------------------------------
app.post("/register", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let userObject = generateUserID(5);

  // add a new user object to the global users object.
  const user = {
    id: userObject,
    email: req.body.email,
    password: req.body.password,
  };

  users[userObject] = user;
  res.cookie("username", userObject); // set a user_id cookie containing the user's newly generated ID

  console.log("Users -------------", users);
  res.redirect("/urls");
});

// ------------------5 character string composed of characters picked randomly for userID
const generateUserID = function (length) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
// -----------------------------------------

/*
Test edge cases such as:

    What would happen if a client requests a non-existent shortURL?
    What happens to the urlDatabase when the server is restarted?
    What type of status code do our redirects have? What does this status code mean?

*/
