const express = require('express');
let books = require("./booksdb.js");
const axios = require('axios');

let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  //Write your code here
  /*
    1. both credentials must be provided
    2. if user is already registered display (already registered)
    3. add user to user's list 
  */
  const username = req.query.username;
  const password = req.query.password;

  if (!username || !password)
    return res.status(400).json({ message: 'Please provide both username and password' })

  //Check if user is already registered
  let exists = users.filter((user) => user.username === username);

  if (exists.length > 0) {
    return res.status(302).json({ message: 'User is already registered' })
  } else {
    users.push({
      username: username, password: password
    })
    return res.status(200).json({ message: 'User registered successfully' })
  }
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  // Task 10
  new Promise((resolve, reject) => {
    resolve(books);
  })
    .then((books) => {
      return res.status(200).json(books);
    }).catch((err) => {
      console.error(err);
      return res.status(500).send('Server error');
    })
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  //Write your code here
  // Task 11
  new Promise((resolve, reject) => {
    const req_isbn = req.params.isbn;

    if (!req_isbn) {
      reject({ status: 400, message: 'Invalid ISBN' })
    } else if (req_isbn in books) {
      resolve({ status: 200, data: books[req_isbn] });
    } else {
      reject({ status: 404, message: 'ISBN not found' })
    }
  }).then((result) => {
    return res.status(result.status).json(result.data)
  }).catch((error) => {
    return res.status(error.status || 500).json({ message: error.message || 'Internal server error' })
  })
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  //Write your code here
  // Task 12
  new Promise((resolve, reject) => {
    const req_author = req.params.author;

    // search for books by author
    const res_author = Object.values(books).find((element) => element.author === req_author);

    if (!req_author) {
      reject({ status: 400, message: 'Invalid author' })
    } else if (res_author) {
      resolve({ status: 200, data: res_author })
    } else {
      reject({ status: 404, message: 'Author not found' });
    }
  }).then((result) => {
    return res.status(result.status).json(result.data);
  }).catch((error) => {
    return res.status(error.status || 500).json({ message: error.message });
  })

});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  //Write your code here
  // Task 13
  new Promise((resolve, reject) => {
    const req_title = req.params.title;

    // search for books by title
    const res_title = Object.values(books).find((element) => element.title === req_title);

    if (!req_title)
      reject({ status: 400, message: 'Invalid book title' })

    if (res_title) {
      resolve({ status: 200, data: res_title })
    } else {
      reject({ status: 400, message: 'Book title not found' })
    }
  }).then((result) => {
    return res.status(result.status).json(result.data);
  }).catch((error) => {
    return res.status(error.status || 500).json({ message: error.message || 'Internal server error' })
  })

});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  //Write your code here
  //Get all book reviews
  const req_isbn = req.params.isbn;

  if (!req_isbn)
    return res.status(400).json({ message: 'Invalid book ISBN' })

  if (req_isbn in books) {
    const res_book = books[req_isbn];
    return res.status(200).json({ reviews: res_book['reviews'] })
  } else {
    return res.status(404).json({ message: 'Book not found' })
  }

});

module.exports.general = public_users;
