// routes/api.js

const express = require("express");
const router = express.Router();

// This route will be accessible at: http://localhost:8000/api/workouts
router.get('/workouts', function (req, res, next) {

    // Query database to get all the workouts
    // We explicitly select specific columns to share via the API
    let sqlquery = "SELECT id, date, activity, duration, calories FROM workouts"

    // Execute the sql query
    db.query(sqlquery, (err, result) => {
        // Return results as a JSON object
        if (err) {
            res.json(err)
            next(err)
        }
        else {
            res.json(result)
        }
    })
})

// Export the router so index.js can find it
module.exports = router;