const express = require("express")
const router = express.Router()

// Middleware to check if user is logged in
const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
        res.redirect('../users/login') 
    } else { 
        next (); 
    } 
}

// 1. LIST WORKOUTS
router.get('/list', function(req, res, next) {
    // Join with users table so we can see WHO did the workout (First Name)
    let sqlquery = `
        SELECT workouts.*, users.first_name 
        FROM workouts 
        JOIN users ON workouts.user_id = users.id
        ORDER BY date DESC
    `;
    
    db.query(sqlquery, (err, result) => {
        if (err) {
            return next(err)
        }
        res.render("list.ejs", { availableWorkouts: result })
    })
})

// 2. SHOW ADD PAGE
router.get('/add', redirectLogin, function(req, res, next) {
    res.render('addworkout.ejs')
})

// 3. HANDLE ADDING A WORKOUT (POST)
router.post('/workoutadded', redirectLogin, function(req, res, next) {
    
    // We need to find the ID of the currently logged-in user
    let userQuery = "SELECT id FROM users WHERE username = ?";
    
    db.query(userQuery, [req.session.userId], (err, userResult) => {
        if (err) return next(err);
        if (userResult.length === 0) return next(new Error("User not found"));

        let currentUserId = userResult[0].id;

        // Now insert the workout with that User ID
        let sqlquery = "INSERT INTO workouts (user_id, date, activity, duration, calories, notes) VALUES (?,?,?,?,?,?)";
        
        let newrecord = [
            currentUserId,
            req.body.date,
            req.sanitize(req.body.activity),
            req.body.duration,
            req.body.calories,
            req.sanitize(req.body.notes)
        ];

        db.query(sqlquery, newrecord, (err, result) => {
            if (err) {
                next(err)
            }
            else {
                res.send(' This workout has been added to database! <a href='+'/workouts/list'+'>Check List</a>' );
            }
        })
    });
})

// 4. SHOW SEARCH PAGE
router.get('/search', function(req, res, next){
    res.render("search.ejs")
})

// 5. HANDLE SEARCH RESULTS
router.get('/search-result', function(req, res, next) {
    // Search for workouts that match the keyword in 'activity' or 'notes'
    let sqlquery = `
        SELECT workouts.*, users.first_name 
        FROM workouts 
        JOIN users ON workouts.user_id = users.id
        WHERE activity LIKE ? OR notes LIKE ?
    `;
    
    let searchTerm = '%' + req.query.keyword + '%';
    
    db.query(sqlquery, [searchTerm, searchTerm], (err, result) => {
        if (err) {
            next(err)
        }
        // We reuse the list template to show results
        res.render("list.ejs", { availableWorkouts: result })
    })
})

module.exports = router