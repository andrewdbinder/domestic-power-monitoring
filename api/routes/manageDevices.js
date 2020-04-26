let express = require('express');
let router = express.Router();
let mysql = require('mysql');

let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "lolo"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");

});

router.get('/', function (req, res, next) {
    console.log(req.headers);
    let action = req.get('action');
    let sql = '';
    let params = [];

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

    console.log(params);
    console.log(mysql.format(sql, params));

    con.query(mysql.format(sql, params), function (err, result, fields) {
        // if (err) throw err;
        // console.log(result);
        console.log('Modifying Devices Table');

        // Call a function to generate packet
        // Send the generated packet
        // Receive the packet
        // send the packet as a http response
        res.send([result, err]);
        console.log(err);
    });
    // console.log(myJSON);
});

module.exports = router;
