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
    // console.log(req.headers);
    let sql =  "SELECT FriendlyName FROM powermonitoring.devices WHERE DeviceID = ?;";
    let params = [req.get('device')];

    console.log(mysql.format(sql, params));

    con.query(mysql.format(sql, params), function (err, result, fields) {

        console.log('Getting Friendly Name');

        res.send(result);
    });
    // console.log(myJSON);
});

module.exports = router;
