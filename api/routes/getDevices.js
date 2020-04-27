let express = require('express');
let router = express.Router();
let mysql = require('mysql');

let powerDB = require('./config');

let connection = powerDB.connectToServer();

// Returns a JSON object of devices requested
router.get('/', function (req, res, next) {
    let sql = '';

    // Check which devices we want, default to active only
    if (req.get('active') === 'all') {
        sql = "SELECT * FROM powermonitoring.devices"
    } else {
        sql = "SELECT * FROM powermonitoring.devices WHERE active = '1'"
    }
    connection.query(mysql.format(sql), function (err, result, fields) {

        // Generate and return HTTP response
        res.send(result);
    });
});

module.exports = router;
