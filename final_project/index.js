const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// add auth for customer
app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }))
app.use("/customer/auth/*", function auth(req, res, next) {
    //Write the authenication mechanism here
    if (req.session.authorization) {
        token = req.session.authorization['accessToken'];
        username = req.session.authorization['username'];
        jwt.verify(token, 'access', (err, user) => {
            if (!err) {
                req.user = username;
                next();
            } else {
                return res.status(403).json({ message: 'User not authenticated' });
            }
        });
    } else {
        return res.status(403).json({ message: 'User not logged in' })
    }
});

// launch
const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
