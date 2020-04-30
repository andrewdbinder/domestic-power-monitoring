let express = require('express');
let router = express.Router();
let mysql = require('mysql');

let db = require('./database');

// Returns a JSON object of devices requested
router.get('/', function (req, res) {
    let sql;

    // Check which devices we want, default to active only
    if (req.get('active') === 'all') {
        sql = "SELECT * FROM powermonitoring.devices ORDER BY FriendlyName"
    } else {
        sql = "SELECT * FROM powermonitoring.devices WHERE active = '1' ORDER BY FriendlyName"
    }


    db.conn.query(mysql.format(sql), function (err, result) {

        // Generate and return HTTP response
        res.send(result);
        console.log(err);
    });
});

module.exports = router;
