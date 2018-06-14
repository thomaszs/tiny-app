var express = require("express");
var cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
var app = express();
var PORT = 8080; // default port 8080

app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.set("view engine", "ejs");

// Used this function to generate random 6 digit alphanumeric short url
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8) // Used substring instead of slice to get strings
}

// Defined database
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let longURL = urlDatabase[req.params.id];
  let templateVars = {
    shortURL: req.params.id,
    longURL: longURL,
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

// Used a separate /u/ directory to test out redirect
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]; // Used shortURL as key to get long URL value
  res.redirect(longURL);
});

// Use POST request to set user cookie
app.post("/login", (req, res) => {
  name = req.body.username
  res.cookie("username", name);
  res.redirect("/urls/");
});

// Clear cookie
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls/");
});

// POST request for /urls
app.post("/urls", (req, res) => {
  let longURL = (req.body); //Took input from the form 
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL["longURL"]; //Used short URL as a key in object, used long URL as value
  res.redirect("/urls/" + shortURL); // Redirected to /urls/:shortURL
});

// POST delete on /urls/:id request by using javascript delete method
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls/");
});

app.post("/urls/:id/", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL
  res.redirect("/urls/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});