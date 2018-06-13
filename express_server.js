var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

function generateRandomString() {
  return Math.random().toString(36).substring(2,8)
}

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.post("/urls", (req, res) => {
  let longURL = (req.body);  // debug statement to see POST parameters
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL["longURL"];
  console.log(urlDatabase);
  res.redirect("/urls/" + shortURL);         // Respond with 'Ok' (we will replace this)
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  let longURL = urlDatabase[req.params.id];
  let templateVars = { shortURL: req.params.id, longURL: longURL };
  res.render("urls_show", templateVars);
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