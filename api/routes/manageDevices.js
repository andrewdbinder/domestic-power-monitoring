let express = require('express');
let router = express.Router();
let mysql = require('mysql');

let powerDB = require('./config');

// Connect to DB
let connection = powerDB.connection;

// Handle server disconnects
powerDB.handleDisconnect(connection);

// Handles control of device table in database
router.get('/', function (req, res) {
    let action = req.get('action');
    let sql = '';
    let params = [];

    // Use header to determine what the request wants
    switch (action) {
        case 'delete':
            sql = "DELETE FROM powermonitoring.devices WHERE DeviceID = ?";
            params = req.get('device');
            break;

        case 'insert':
            sql = "INSERT INTO powermonitoring.devices VALUES ( ?, ?, 1)";
            params = [req.get('deviceid'), req.get('devicename')];
            break;

        case 'changeactive':
            sql = "UPDATE powermonitoring.devices SET active = ? WHERE DeviceID = ?";
            let active = +(req.get('active') === 'true');
            params = [ active, req.get('deviceid')];
            break;
        default:
            console.log(action);
    }

    connection.query(mysql.format(sql, params), function (err, result) {
        res.send([result, err]);
        console.log(err);
    });
});

module.exports = router;
