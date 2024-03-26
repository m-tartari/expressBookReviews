const express = require("express");
const axios = require("axios").default;
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
let url = "some remote url";
public_users.get("/", async function (_req, res) {
  const result = await axios.get(url).catch(function (error) {
    if (error.response) {
      // The request was made and the server responded with a status code that falls out of the range of 2xx
      return res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      return res.status(500).json({ message: "The request was made but no response was received" });
    } else {
      // Something happened in setting up the request that triggered an Error
      return res.status(500).json({ message: error.message });
    }
  });

  const books = result.data;
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
  function getBookByIsbn(isbn) {
    return new Promise(function (resolve, reject) {
      if (isbn in books) {
        resolve(books[isbn]);
      }
      reject(`Isbn ${isbn} not found`);
    });
  }

  getBookByIsbn(req.params.isbn)
    .then((book) => {
      return res.status(200).json(book);
    })
    .catch((err) => {
      return res.status(400).json({ message: err });
    });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  function getBooksByAutor(autor) {
    return new Promise(function (resolve, reject) {
      if (!autor) {
        reject("No author provided.");
      }
      const booksFilteed = {};
      Object.entries(books).forEach(([isbn, book]) => {
        if (book.author === req.params.author) {
          booksFilteed[isbn] = book;
        }
        resolve(booksFilteed);
      });
    });
  }
  getBooksByAutor(req.params.author)
  .then((booksFilteed) => {
    return res.status(200).json(booksFilteed);
  })
  .catch((err) => {
    return res.status(400).json({ message: err });
  });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  function getBooksByTitle(title) {
    return new Promise(function (resolve, reject) {
      if (!title) {
        reject("No title provided.");
      }
      const booksFilteed = {};
      Object.entries(books).forEach(([isbn, book]) => {
        if (book.title === req.params.title) {
          booksFilteed[isbn] = book;
        }
        resolve(booksFilteed);
      });
    });
  }
  getBooksByTitle(req.params.author)
  .then((booksFilteed) => {
    return res.status(200).json(booksFilteed);
  })
  .catch((err) => {
    return res.status(400).json({ message: err });
  });
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
