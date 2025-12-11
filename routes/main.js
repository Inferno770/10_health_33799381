// Create a new router
const express = require("express")
const router = express.Router()
const request = require('request')

// Middleware to protect routes (users must be logged in)
const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
        res.redirect('./users/login') 
    } else { 
        next (); 
    } 
}

// Handle our routes

// HOME PAGE
router.get('/', function(req, res, next){
    res.render('index.ejs')
});

// ABOUT PAGE
router.get('/about', function(req, res, next){
    res.render('about.ejs')
});

// WEATHER ROUTE (Great for outdoor workouts!)
router.get('/weather', function(req, res, next){
    let city = req.query.city; 
    let apiKey = process.env.WEATHER_API_KEY; // Make sure this is in your .env file!

    if (!city) {
        return res.render('weather.ejs', { weather: null, error: null });
    }

    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
             
    request(url, function (err, response, body) {
        if(err){
            next(err);
        } else {
            let weather = JSON.parse(body);

            if (weather !== undefined && weather.main !== undefined) {
                res.render('weather.ejs', { weather: weather, error: null });
            } 
            else {
                res.render('weather.ejs', { weather: null, error: "Error: City not found or API issue." });
            }
        } 
    });
});

// LOGOUT ROUTE
router.get('/logout', redirectLogin, (req,res) => {
    req.session.destroy(err => {
    if (err) {
      return res.redirect('./')
    }
    res.send('You are now logged out. <a href='+'./'+'>Return to Home</a>');
    })
})

// Export the router object so index.js can access it
module.exports = router