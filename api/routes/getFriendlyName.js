let express = require('express');
let router = express.Router();
let mysql = require('mysql');

let powerDB = require('./config');

let connection = powerDB.connectToServer();

// Returns the friendly name of a given device
router.get('/', function (req, res, next) {
    let sql =  "SELECT FriendlyName FROM powermonitoring.devices WHERE DeviceID = ?;";
    let params = [req.get('device')];

    // Generate and run SQL query on DB
    connection.query(mysql.format(sql, params), function (err, result, fields) {
        res.send(result);
    });
});

module.exports = router;