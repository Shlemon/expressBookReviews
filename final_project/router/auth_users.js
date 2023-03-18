const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  //write code to check is the username is valid
  let found = users.filter((user) => user.username === username);

  if (found.length > 0) {
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username, password) => { //returns boolean
  //write code to check if username and password match the one we have in records.
  let valid_user = users.filter((user) => {
    return (user.username === username && user.password === password)
  })

  if (valid_user.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here
  const username = req.query.username;
  const password = req.query.password;

  if (!username || !password)
    return res.status(404).json({ message: 'Error logging in' })

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = { accessToken, username }
    return res.status(200).send('User successfully logged in')
  } else {
    return res.status(208).json({ message: "Invalid login. check username and password" })
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;

  const review = req.query.review;
  const user = req.user;

  // iterate books and find whether this user has reviews the desired book
  const book_reviews = books[isbn].reviews;

  if (user in book_reviews) {
    // modify review
    console.log('Inside object keys')
    book_reviews[user] = review;
    books[isbn].reviews = book_reviews;
    return res.status(200).json({ message: 'Modified review successfully' })
  } else {
    // add review
    book_reviews[user] = review;
    books[isbn].reviews = book_reviews
    return res.status(200).json({ message: 'Added review successfully' })
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const user = req.user;

  const book = books[isbn];

  // delete review of this user
  if (user in book.reviews) {
    delete book.reviews[user];
    return res.status(200).json({ message: 'Review deleted successfully' });
  } else {
    return res.status(404).json({ message: 'Book not reviewed' })
  }
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
