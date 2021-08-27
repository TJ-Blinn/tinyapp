const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// set the view engine to ejs
app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
// -------------------------------
// use res.render to load up an ejs view file

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
  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL };
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
