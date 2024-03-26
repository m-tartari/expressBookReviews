const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(404).json({ message: "Unable to register user." });
  }
  if (isValid(username)) {
    return res.status(400).json({ message: "User already exists!" });
  }

  users[username] = password;
  return res.status(200).json({ message: "User successfully registred. Now you can login" });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  if (!isbn in books) {
    return res.status(404).json({ message: `Isbn ${isbn} not found` });
  }
  return res.status(200).json(books[isbn]);
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const booksFilteed = {};
  Object.entries(books).forEach(([isbn, book]) => {
    if (book.author === req.params.author) {
      booksFilteed[isbn] = book;
    }
  });
  return res.status(200).json(booksFilteed);
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const booksFilteed = {};
  Object.entries(books).forEach(([isbn, book]) => {
    if (book.title === req.params.title) {
      booksFilteed[isbn] = book;
    }
  });
  return res.status(200).json(booksFilteed);
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  if (!isbn in books) {
    return res.status(404).json({ message: `Isbn ${isbn} not found` });
  }
  return res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;
