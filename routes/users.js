// Create a new router
const express = require("express")
const router = express.Router()
const bcrypt = require('bcrypt')
const { check, validationResult } = require('express-validator');

const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
      res.redirect('./login') // redirect to the login page
    } else { 
        next (); // move to the next middleware function
    } 
}

router.get('/register', function (req, res, next) {
    res.render('register.ejs')
})

router.post('/registered', [
    // 1. Validation Rules
    check('email').isEmail(),
    check('username').isLength({ min: 5, max: 20 }),
    check('password').isLength({ min: 8 }),
    check('first').notEmpty(),
    check('last').notEmpty()

], function (req, res, next) {

    // 2. Check for validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // If errors exist (e.g. bad email), redirect back to register page
        res.redirect('./register'); 
    } 
    else { 
        // 3. No errors? Proceed with the original Registration logic
        const plainPassword = req.body.password
        const saltRounds = 10

        // hash the password using bcrypt
        bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
            if (err) {
                return next(err)
            }

            // prepare the SQL query 
            let sqlquery = "INSERT INTO users (username, first_name, last_name, email, hashedPassword) VALUES (?,?,?,?,?)"
            
            // organize the data to insert
            let newrecord = [
                req.sanitize(req.body.username), // Clean the username
                req.sanitize(req.body.first),    // Clean the first name
                req.sanitize(req.body.last),     // Clean the last name
                req.sanitize(req.body.email), 
                hashedPassword
            ]

            // execute the query
            db.query(sqlquery, newrecord, (err, result) => {
                if (err) {
                    return next(err)
                }
                // sends success message
                let msg = 'Hello '+ req.sanitize(req.body.first) + ' '+ req.sanitize(req.body.last) +' you are now registered! We will send an email to you at ' + req.sanitize(req.body.email)
                msg += ' Your password is: '+ req.body.password +' and your hashed password is: '+ hashedPassword
                res.send(msg)
            })
        })
    }
})


router.get('/list', redirectLogin, function(req, res, next) {
    let sqlquery = "SELECT * FROM users"; // query database to get all the users
    
    // executes sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err);
        }
        // renders the userlist.ejs template and pass the result
        res.render("userlist.ejs", { availableUsers: result });
    });
});

router.get('/login', function (req, res, next) {
    res.render('login.ejs')
})

router.post('/loggedin', function (req, res, next) {
    let sqlquery = "SELECT hashedPassword FROM users WHERE username = ?"
    let cleanUsername = req.sanitize(req.body.username);
    
    db.query(sqlquery, [cleanUsername], (err, result) => {
        if (err) { return next(err) }

        // --- SCENARIO 1: USER NOT FOUND ---
        if (result.length === 0) {
            // Log the failure
            let auditQuery = "INSERT INTO audit_log (username, action) VALUES (?, ?)";
            db.query(auditQuery, [req.body.username, "Failed - User not found"]);

            return res.send('Login failed: Username not found.')
        }

        let hashedPassword = result[0].hashedPassword

        bcrypt.compare(req.body.password, hashedPassword, function(err, match) {
            if (err) { return next(err) }
            
            // --- SCENARIO 2: LOGIN SUCCESSFUL ---
            if (match == true) {
                // Log the success
                let auditQuery = "INSERT INTO audit_log (username, action) VALUES (?, ?)";
                db.query(auditQuery, [req.body.username, "Successful Login"]);

                // Save user session here, when login is successful
                req.session.userId = req.body.username;

                res.send('Login successful! Hello ' + req.body.username)
            } 
            // --- SCENARIO 3: WRONG PASSWORD ---
            else {
                // Log the failure
                let auditQuery = "INSERT INTO audit_log (username, action) VALUES (?, ?)";
                db.query(auditQuery, [req.body.username, "Failed - Wrong Password"]);
                res.send('Login failed: Incorrect password.')
            }
        })
    })
})

router.get('/audit', redirectLogin, function(req, res, next) {
    // Select all logs, newest first
    let sqlquery = "SELECT * FROM audit_log ORDER BY timestamp DESC";
    
    db.query(sqlquery, (err, result) => {
        if (err) { return next(err) }
        
        res.render("audit.ejs", { auditData: result });
    });
});

// Logout Route
router.get('/logout', function (req, res, next) {
    req.session.destroy(function(err) {
        if (err) {
            return next(err);
        }
        // Redirect to the login page after logging out
        res.redirect('./login'); 
    })
})

// Export the router object so index.js can access it
module.exports = router