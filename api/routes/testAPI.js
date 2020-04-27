let express = require('express');
let router = express.Router();
let mysql = require('mysql');

let powerDB = require('./config');

let connection = powerDB.connectToServer();

function convertUTCDateToLocalDate(date) {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
}

router.get('/', function (req, res, next) {
    let startDateHdr = new Date(req.get('startdate'));
    let endDateHdr = new Date(req.get('enddate'));

    // Typecasting for sql datetime format B)
    let startDate = convertUTCDateToLocalDate(startDateHdr).toISOString().substring(0, 10) + ' '
                        + convertUTCDateToLocalDate(startDateHdr).toISOString().substring(11, 19);
    let endDate = convertUTCDateToLocalDate(endDateHdr).toISOString().substring(0, 10)
                        + ' ' + convertUTCDateToLocalDate(endDateHdr).toISOString().substring(11, 19);

    let params = [startDate, endDate, req.get('devices')];

    let sql =  "SELECT * FROM powermonitoring.powerusage WHERE MeasurementTime" +
                " BETWEEN CAST(? AS DATETIME)" +
                " AND CAST(? AS DATETIME)" +
                " AND Device = ?;";


    connection.query(mysql.format(sql, params), function (err, result, fields) {
        res.send(result);
    });

});

module.exports = router;
