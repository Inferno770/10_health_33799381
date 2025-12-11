require('dotenv').config();

// Import express, ejs and session
var express = require ('express')
var ejs = require('ejs')
var session = require ('express-session')
const expressSanitizer = require('express-sanitizer');
const apiRoutes = require('./routes/api');
const path = require('path')

var mysql = require('mysql2');

// Create the express application object
const app = express()
const port = 8000

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs')

// Set up the body parser 
app.use(express.urlencoded({ extended: true }))

app.use(expressSanitizer());

// Set up public folder (for css and static js)
app.use(express.static(path.join(__dirname, 'public')))

// Create a session
app.use(session({
    secret: 'somerandomstuff',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}))

app.locals.appData = {appName: "FitTrack"}

// Define the database connection pool
const db = mysql.createPool({
    host: process.env.HEALTH_HOST,       // UPDATED
    user: process.env.HEALTH_USER,       // UPDATED
    password: process.env.HEALTH_PASSWORD, // UPDATED
    database: process.env.HEALTH_DATABASE, // UPDATED
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
global.db = db;

// Load the route handlers
const mainRoutes = require("./routes/main")
app.use('/', mainRoutes)

// Load the route handlers for /users
const usersRoutes = require('./routes/users')
app.use('/users', usersRoutes)

// Load the route handlers for /workouts (Replaces /books)
const workoutsRoutes = require('./routes/workouts.js')
app.use('/workouts', workoutsRoutes)

app.use('/api', apiRoutes);

// Start the web app listening
app.listen(port, () => console.log(`FitTrack app listening on port ${port}!`))