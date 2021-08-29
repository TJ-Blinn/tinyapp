const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = 8080; // default port 8080

// set the view engine to ejs
app.set("view engine", "ejs");

// middleware Body-parser
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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

// GET Route for form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// route handler for /urls
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// route handler for /urls_show
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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
  console.log(req.body);
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

/*
Test edge cases such as:

    What would happen if a client requests a non-existent shortURL?
    What happens to the urlDatabase when the server is restarted?
    What type of status code do our redirects have? What does this status code mean?

*/
