let express = require('express');
let router = express.Router();
let mysql = require('mysql');

let powerDB = require('./config');

let connection = powerDB.connectToServer();

router.get('/', function (req, res, next) {
    let sql = '';

    if (req.get('active') === 'all') {
        sql = "SELECT * FROM powermonitoring.devices"
    } else {
        sql = "SELECT * FROM powermonitoring.devices WHERE active = '1'"
    }
    connection.query(mysql.format(sql), function (err, result, fields) {

        // Call a function to generate packet
        // Send the generated packet
        // Receive the packet
        // send the packet as a http response

        res.send(result);
    });
});

module.exports = router;
