const express = require("express");
const cookieSession = require('cookie-session')
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}))

app.set("view engine", "ejs");

// Used this function to generate random 6 digit alphanumeric short url
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8) // Used substring instead of slice to get strings
}


const urlDatabase = {
  "b2xVn2": {
    shortUrl: "b2xVn2",
    longUrl: "http://www.lighthouselabs.ca",
    userID: "user1"
  },
  "9sm5xK": {
    shortUrl: "9sm5xK",
    longUrl: "http://www.google.com",
    userID: "user2"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2": {
    id: "user2",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "user1": {
    id: "user1",
    email: "user1@abc.com",
    password: "123"
  }
}

app.get("/", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    res.redirect("/login");
    return;
  }
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    res.redirect("/urls")
  }
  res.render("urls_register");
});

app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    res.redirect("/urls")
  }
  res.render("urls_login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    res.redirect("/login/");
  }
  res.render("urls_new", {user: users[userID]});
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  let templateVars = {
    urls: urlsForUser(userID),
    user: users[userID]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  if (userID !== urlDatabase[req.params.id]['userID']) {
    res.send("This is not your url!")
    return;
  }
  let longURL = urlDatabase[req.params.id]['longUrl'];
  let templateVars = {
    shortURL: req.params.id,
    longURL,
    user: users[userID]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longUrl; // Used shortURL as key to get long URL value
  res.redirect(longURL);
});

// POST for register
app.post("/register", (req, res) => {
  let id = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  let hashedPassword = bcrypt.hashSync(password,10);

  //Check for empty email or password and send 400 status code
  if (!email || !password) {
    res.status(400).send("Email or password can't be empty");
    return;
  } //Check for exising email address and send 400 status code

  let userExists = false;
  for (var existing in users) {
    let existingEmail = users[existing]['email'];
    if (existingEmail === email) {
      userExists = true
      break;
    }
  }

  if (userExists) {
    res.status(400).send("User already exist");
  } else if (!userExists) {
    //Store user information in users database and add cookie
    users[id] = {
      id,
      email,
      hashedPassword
    };
    req.session.user_id = users[id].id
    res.redirect("/urls");
  }

});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  let emailMatch = false;
  let passMatch = false;
  for (var id in users) {
    let dataEmail = users[id]['email'];
    let dataPassword = users[id]['hashedPassword'];

    if (dataEmail === email) {
      emailMatch = true;
      if (bcrypt.compareSync(password, dataPassword)) {
        passMatch = true;
        break;
      } else if (dataEmail !== email) {}
      if (bcrypt.compareSync(password, dataPassword)) {}
    }
  }

  if (emailMatch && passMatch) {
    req.session.user_id = users[id].id
    res.redirect("/urls/");
  } else {
    res.status(403).send("Your email or password is incorrect");
  }
});

// Clear cookie
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls/");
});

// POST request for /urls
app.post("/urls", (req, res) => {
  let longUrl = req.body.longURL; //Took input from the form 
  let shortUrl = generateRandomString();
  const userID = req.session.user_id;

  urlDatabase[shortUrl] = {
    shortUrl,
    longUrl,
    userID,
  }
  res.redirect("/urls/" + shortUrl); // Redirected to /urls/:shortURL
});

// POST delete on /urls/:id request by using javascript delete method
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
  if (userID === urlDatabase[req.params.id]['userID']) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls/");
  }
});

app.post("/urls/:id/", (req, res) => {
  urlDatabase[req.params.id]['longUrl'] = req.body.longURL
  res.redirect("/urls/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function urlsForUser(id) {
  let newDataBase = {};
  for (key in urlDatabase) {
    if (id === urlDatabase[key].userID) {
      newDataBase[key] = urlDatabase[key];
    }
  }
  return newDataBase;
}