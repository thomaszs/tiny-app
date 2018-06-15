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


const urlDatabase = {
  "b2xVn2": {
    shortUrl: "b2xVn2",
    longUrl: "http://www.lighthouselabs.ca",
    userID: "user1"
  },
  "9sm5xK": {
    shortUrl: "9sm5xK",
    longUrl:"http://www.google.com",
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
  const userID = req.cookies['user_id'];
  if (userID !== urlDatabase[req.params.id]['userID']) {
    res.send("Please log in first!");
  }
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies['user_id'];
  if (!userID) {
    res.redirect("/login/");
  }
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  const userID = req.cookies['user_id'];
  let newDatabase = urlsForUser(userID);

  let templateVars = {
    urls: newDatabase,
    user: users[userID]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userID = req.cookies['user_id'];
  if (userID !== urlDatabase[req.params.id]['userID']) {
    res.send("This is not your url!")
    return;
  }
  let longURL = urlDatabase[req.params.id]['longUrl'];
  let templateVars = {
    shortURL: req.params.id,
    longURL: longURL,
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

  if (userExists === true) {
    res.status(400).send("User already exist");
  } else if (userExists === false) {
    //Store user information in users database and add cookie
    users[id] = {
      id: id,
      email: email,
      password: password
    };
    res.cookie("user_id", users[id].id);
    res.redirect("/urls/");
  }

});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  let emailMatch = false;
  let passMatch = false;
  for (var id in users) {
    let dataEmail = users[id]['email'];
    let dataPassword = users[id]['password'];

    if (dataEmail === email) {
      emailMatch = true;
      if (dataPassword === password) {
        passMatch = true;
        break;
      } else if (dataEmail !== email) {}
      if (dataPassword !== password) {}
    }
  }

  if (emailMatch || passMatch === true) {
    res.cookie("user_id", users[id].id);
    res.redirect("/urls/");
    return;
  } else {
    res.status(403).send("Your email or password is incorrect");
    return;
  }
});

// Clear cookie
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls/");
});

// POST request for /urls
app.post("/urls", (req, res) => {
  let longURL = (req.body.longURL); //Took input from the form 
  let shortURL = generateRandomString();
  const userID = req.cookies['user_id'];

  urlDatabase[shortURL] = {
    shortUrl: shortURL,
    longUrl: longURL,
    userID: userID,
  }
  res.redirect("/urls/" + shortURL); // Redirected to /urls/:shortURL
});

// POST delete on /urls/:id request by using javascript delete method
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.cookies['user_id'];
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
