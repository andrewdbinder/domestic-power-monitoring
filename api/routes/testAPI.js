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
    con.query("SELECT * FROM powermonitoring.powerusage WHERE MeasurementTime BETWEEN CAST('2020-02-06' AS DATE) AND CAST('2020-02-07' AS DATE);", function (err, result, fields) {
        // if (err) throw err;
        // console.log(result);
        console.log('Querying PowerUsage Table');
        res.send(result);
    });
    // console.log(myJSON);

});

module.exports = router;
