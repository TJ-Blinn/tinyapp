const express = require("express");
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const {getUserByEmail, urlsForUser, generateRandomString, generateUserID } = require("./helpers");

const app = express();
const PORT = 8080;
app.set("view engine", "ejs");

// middleware cookie-parser 1st, Body-parser
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
  const userID = req.session.user_id;
  console.log("____________", userID);
  const userObj = users[userID];
  const userURLS = urlsForUser(userID, urlDatabase);
  
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
  const userID = req.session["user_id"];
  const userObj = users[userID];
  // const userURLS = urlsForUser(userID, urlDatabase);
  const shortURL = req.params.shortURL;
    
  if (!urlDatabase[shortURL]) { // shortURL does not exist in database, otherwise exit with res.send
    return res.status(400).send("This shortURL does not exist");
  }
  
  if (urlDatabase[shortURL].userID !== userID) { // ownership of url established
    return res.status(400).send("This shortURL does not belong to you");
  }
  // urlDatabase[shortURL] must exist if it reaches this point, where we can now define templateVars.
  const templateVars = { user: userObj, shortURL: shortURL, longURL: urlDatabase[shortURL].longURL };
  return res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// /urls.json - routing for urlDatabase object in browser
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// POST request is received to /urls
app.post("/urls", (req, res) => {
  let randoURL = generateRandomString(5);
  const longURL = req.body.longURL;
  const userID = req.session["user_id"];

  urlDatabase[randoURL] = {longURL, userID};
  // when long url is entered on website, is received req.body.longURL; (url_new page === name)
  res.redirect("/urls");
});

// URL in browser "/u/:shortURL" will redirect to its longURL
app.get("/u/:shortURL", (req, res) => {
  // const userID = req.session["user_id"];
  const shortURL = req.params.shortURL;
  const urlObj = urlDatabase[shortURL];

  if (!urlDatabase[shortURL]) { // shortURL does not exist in database, otherwise exit with res.send
    return res.status(400).send("This shortURL does not exist");
  }
  
  return res.redirect(urlObj.longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session["user_id"];
  const shortURL = req.params.shortURL;
  
  if (!userID && urlDatabase[shortURL].userID !== userID) { // ownership of url established
    return res.status(400).send("Must be logged in to access this page. Please login or Register.\n");
  } else {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});

// POST route for /urls/:id | The edit function reassigns(updates) the longURL
app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session["user_id"];
  const userURLS = urlsForUser(userID, urlDatabase);

  if (!userID) {
    return res.status(400).send("Must be logged in to access this page. Please login or Register.\n");
  }
  
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
    return res.status(403).send("Email or Password not found");
  }
  if (!bcrypt.compareSync(password, user.password)) { // compareSynch takes in 2 params: unhashed pwd, hashed pwd
    return res.status(403).send("Email or Passwordis invalid");
  }

  req.session["user_id"]  = user.id;
  res.redirect("/urls");
});

// register endpoint
app.get("/register", (req, res) => {
  res.render("pages/register", { user: undefined });
});

// POST register
app.post("/register", (req, res) => {
  const password = req.body.password;
  const email = req.body.email;
      
  // Handle Registration error conditions: e-mail or password are empty strings
  if (!email || !password) {
    return res.status(400).send("Email and Password required");
  }
  const user = getUserByEmail(email, users); // return a user with an email, else returns false
  if (user) {
    return res.status(400).send("Email already exists");
  }
  // add a new user object to the global users object.
  let id = generateUserID(5);
  const hashedPassword = bcrypt.hashSync(password, salt);
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