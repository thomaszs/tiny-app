var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

// Used this function to generate random 6 digit alphanumeric short url
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8) // Used substring instead of slice to get strings
}

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));

// Defined database
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


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

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let longURL = urlDatabase[req.params.id];
  let templateVars = {
    shortURL: req.params.id,
    longURL: longURL
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL
  res.redirect("/urls/");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});


// Used a separate /u/ directory to test out redirect
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]; // Used shortURL as key to get long URL value
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});