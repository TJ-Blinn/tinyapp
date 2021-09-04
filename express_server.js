const express = require("express");
//const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
// const {getUserByEmail, urlsForUser, generateRandomString } = require("./helper")
const getUserByEmail = require("./helpers");

const app = express();
const PORT = 8080; // default port 8080
// set the view engine to ejs
app.set("view engine", "ejs");

// middleware cookie-parser 1st, Body-parser
//app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));


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
  return userURLS;
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "1@1.com",
    password: bcrypt.hashSync("1", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "b@b.com",
    password: bcrypt.hashSync("1111", 10)
  },
};

// route handler for urls/new - GET Route for form + cookies
app.get("/urls/new", (req, res) => {
  const userID = req.session["user_id"];
  // currently logged in user ID. In the cookie that was set when user logged in.
  const userObj = users[userID];

  if (!userID) {
    return res.redirect("/login");
  }

  const templateVars = { user: userObj, urls: urlDatabase };
  res.render("urls_new", templateVars);
});

// route handler for /urls + cookies
app.get("/urls", (req, res) => {
  const userID = req.session.user_id; // currently logged in user ID. In the cookie that was set when user logged in.
  console.log("____________", userID);
  const userObj = users[userID];
  const userURLS = urlsForUser(userID);
  // if (!userID) {
  //   return res.status(400).send("Must be logged in to access this page. Please login or Register.");

  // }

  const templateVars = { user: userObj, urls: userURLS };
  res.render("urls_index", templateVars);
});

// The logout route
app.post("/urls/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// route handler for /urls_show + cookies
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session["user_id"]; // currently logged in user ID. In the cookie that was set when user logged in.
  const userObj = users[userID];
  const userURLS = urlsForUser(userID);

  const templateVars = { user: userObj, shortURL: req.params.shortURL, longURL: userURLS[req.params.shortURL].longURL };
  // Use the shortURL from the route parameter to lookup it's associated longURL from the urlDatabase

  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// /urls.json - another page - routing for urlDatabase object in browser
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// POST request
app.post("/urls", (req, res) => {
  // console.log(req.body); // Log the POST request body to the console
  let randoURL = generateRandomString(5);
  const longURL = req.body.longURL;
  const userID = req.session["user_id"];

  urlDatabase[randoURL] = {longURL, userID};
  // urlDatabase[randoURL] = req.body.longURL; // when long url is entered on website, is received req.body.longURL; (url_new page === name)
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

// URL in browser "/u/:shortURL" will redirect to its longURL
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
  const userID = req.session["user_id"];
  const userURLS = urlsForUser(userID);

  if (!userID) {
    return res.status(400).send("Must be logged in to access this page. Please login or Register.\n");
  } else {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});

// The edit function reassigns(updates) the longURL
app.post("/urls/:shortURL", (req, res) => {

  const userID = req.session["user_id"];
  const userURLS = urlsForUser(userID);

  if (!userID) {
    return res.status(400).send("Must be logged in to access this page. Please login or Register.\n");
  }
  console.log(req.body);
  if (userURLS[req.params.shortURL]) {
    urlDatabase[req.params.shortURL] = { longURL: req.body.longURL, userID: userID };
  }
  
  res.redirect("/urls");
});

// route handler for /login
app.get("/login", (req, res) => {
  const userID = req.session["user_id"]; // currently logged in user ID. In the cookie that was set when user logged in.
  const userObj = users[userID];

  const templateVars = { user: userObj, urls: urlDatabase };

  res.render("pages/login", templateVars);
});

// The login route // sending to server (form with username)
app.post("/login", (req, res) => {
  const {email, password} = req.body;

  if (!email || !password) {
    return res.status(403).send("Email and Password required");
  }
  const user = getUserByEmail(email, users); // return a user with an email, else returns false
  if (!user) {
    return res.status(403).send("Email not found");
  }

  // console.log(bcrypt.hashSync(password, salt));
  // console.log(user.password);
  if (!bcrypt.compareSync(password, user.password)) { // compareSynch takes in 2 params: unhashed pwd, hashed pwd
    return res.status(403).send("Password is invalid");
  }
  req.session["user_id"]  = user.id;
    
  res.redirect("/urls");
});

// register endpoint
app.get("/register", (req, res) => {
  res.render("pages/register", { user: undefined });
});

// POST request ----------------------------------------------
app.post("/register", (req, res) => {
  
  let id = generateUserID(5);
  const password = req.body.password;
  const email = req.body.email;
  const hashedPassword = bcrypt.hashSync(password, salt);
    
  // Handle Registration error conditions: e-mail or password are empty strings
  if (!email || !password) {
    return res.status(400).send("Email and Password required");
  }
  const user = getUserByEmail(email, users); // return a user with an email, else returns false
  if (user) {
    return res.status(400).send("Email already exists");
  }
  // add a new user object to the global users object.
  const userObject = {
    id,
    email: email,
    password: hashedPassword,
  };
  // adding user to the users object
  users[id] = userObject;
  req.session["user_id"] = id; // set a user_id cookie containing the user's newly generated ID
  
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

