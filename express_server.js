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
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  rth03e: { longURL: "http://msn.com", userID: "userRandomID"}
};

// function returns the URLs where the userID is equal to the id of the currently logged-in user.
const urlsForUser = function (id) {
  const userURLS = {};
  const keys = Object.keys(urlDatabase);
  
  for (const key of keys) {
    if (urlDatabase[key].userID === id) {
      userURLS[key] = urlDatabase[key]; // assigning key value pair into our empty object | value of the key becomes the value inside urlDatabase
    }
  }
  //console.log("ID++++++++++++++", id);
  return userURLS;
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "1@1.com",
    password: "1",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "b@b.com",
    password: "1111",
  },
};

// route handler for urls/new - GET Route for form + cookies
app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"]; // currently logged in user ID. In the cookie that was set when user logged in.
  const userObj = users[userID];

  if (!userID) {
    return res.redirect("/login");
  }

  const templateVars = { user: userObj, urls: urlDatabase };
  res.render("urls_new", templateVars);
});

// route handler for /urls + cookies
app.get("/", (req, res) => {
  const userID = req.cookies["user_id"]; // currently logged in user ID. In the cookie that was set when user logged in.
  const userObj = users[userID];
  const userURLS = urlsForUser(userID);
  if (!userID) {
    return res.status(400).send("Must be logged in to access this page. Please login or Register.");

  }

  const templateVars = { user: userObj, urls: userURLS };
  res.render("urls_index", templateVars);
});

// route handler for /urls_show + cookies
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies["user_id"]; // currently logged in user ID. In the cookie that was set when user logged in.
  const userObj = users[userID];
  const userURLS = urlsForUser(userID);

  const templateVars = { user: userObj, shortURL: req.params.shortURL, longURL: userURLS[req.params.shortURL] };
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
  const longURL = req.body.longURL;
  const userID = req.cookies["user_id"];

  urlDatabase[randoURL] = {longURL, userID};
  // urlDatabase[randoURL] = req.body.longURL; // when long url is entered on website, is received req.body.longURL; (url_new page === name)
  res.redirect("/");
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
  const urlObj = urlDatabase[req.params.shortURL];
  // console.log("***********", req.params, urlObj);
  if (urlObj) {
    return res.redirect(urlObj.longURL);
  } else {
    res.status(404).send("shortURL does not exist"); // NOT Found adds 404 to res, then chains to send message to browser
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.cookies["user_id"];
  const userURLS = urlsForUser(userID);

  if (!userID) {
    return res.status(400).send("Must be logged in to access this page. Please login or Register.\n");
  }

  if (userURLS[req.params.shortURL]) {
    delete userURLS[req.params.shortURL];
  }
  res.redirect("/");
});

// The edit function reassigns(updates) the longURL
app.post("/urls/:shortURL/update", (req, res) => {

  const userID = req.cookies["user_id"];
  const userURLS = urlsForUser(userID);

  if (!userID) {
    return res.status(400).send("Must be logged in to access this page. Please login or Register.\n");
  }

  if (userURLS[req.params.shortURL]) {
    urlDatabase[req.params.shortURL] = req.body.longURL;
  }
  
  res.redirect("/");
});

// route handler for /login
app.get("/login", (req, res) => {
  const userID = req.cookies["user_id"]; // currently logged in user ID. In the cookie that was set when user logged in.
  const userObj = users[userID];

  const templateVars = { user: userObj, urls: urlDatabase };

  res.render("pages/login", templateVars);
});

// The login route // cookies that have not been signed. POST -> sending to server (form with username)
app.post("/login", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(403).send("Email and Password required");
  }
  const user = emailCheck(req.body.email, users); // return a user with an email, else returns false
  if (!user) {
    return res.status(403).send("Email not found");
  }

  if (user.password !== req.body.password) {
    return res.status(403).send("Password is invalid");
  }

  res.cookie("user_id", user.id);
  // req,body comes from values in form - NOT cookie. This is what sets the cookie.
  
  res.redirect("/");
});

// The logout route
app.post("/urls/logout", (req, res) => {
  res.clearCookie("user_id"); // clear cookies (user) then redirect

  res.redirect("/");
});

// register endpoint
app.get("/register", (req, res) => {
  res.render("pages/register", { user: undefined });
});

// email verification function || check at point of registration and loggin in
const emailCheck = (email, users) => {
  for (const key in users) {
    if (users[key].email === email) {
      return users[key]; // user object
    }
  }
  return false;
};

// POST request ----------------------------------------------
app.post("/register", (req, res) => {
  // console.log(req.body); // Log the POST request body to the console
  let id = generateUserID(5);

  // Handle Registration error conditions: e-mail or password are empty strings
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Email and Password required");
  }
  const user = emailCheck(req.body.email, users); // return a user with an email, else returns false
  if (user) {
    return res.status(400).send("Email already exists");
  }
  // add a new user object to the global users object.
  const userObject = {
    id,
    email: req.body.email,
    password: req.body.password,
  };
  users[id] = userObject;
  res.cookie("user_id", id); // set a user_id cookie containing the user's newly generated ID
  console.log("______________", users);

  res.redirect("/");
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
