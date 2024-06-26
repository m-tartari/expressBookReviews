const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = {
  // [username:string]:string // password
  user1: "user1",
  user2: "user2",
  user3: "user3",
};

//returns boolean
const isValid = (username) => {
  return username in users;
};

//returns boolean
const authenticatedUser = (username, password) => {
  return isValid(username) && users[username] === password;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ data: password, username: username }, "access", { expiresIn: 60 * 60 });

    req.session.authorization = { accessToken, username };
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(400).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  if (!isbn in books) {
    return res.status(404).json({ message: `ISBN ${isbn} not found` });
  }
  books[isbn].reviews[req.user] = req.query.review;
  return res.status(200).json(`The review for book with ISBN ${isbn} has been added/modified`);
});

// Add a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  if (!isbn in books) {
    return res.status(404).json({ message: `ISBN ${isbn} not found` });
  }
  delete books[isbn].reviews[req.user];
  return res.status(200).json(`The review by ${req.username} for book with ISBN ${isbn} has been deleted`);
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
