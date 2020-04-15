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
    con.query("SELECT * FROM powermonitoring.powerusage WHERE MeasurementTime BETWEEN CAST('2020-02-05 23:00:00' AS DATETIME) AND CAST('2020-02-06 4:00:00' AS DATETIME);", function (err, result, fields) {
        // if (err) throw err;
        // console.log(result);
        console.log('Querying PowerUsage Table');
        res.send(result);
    });
    // console.log(myJSON);

});

module.exports = router;
