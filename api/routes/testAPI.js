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

function convertUTCDateToLocalDate(date) {
    let newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);

    let offset = date.getTimezoneOffset() / 60;
    let hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;
}

router.get('/', function (req, res, next) {
    console.log(req.headers);
    console.log(req.get('startdate').substring(0, 10));
    console.log(req.get('startdate').substring(11, 19));
    let startDateHdr = new Date(req.get('startdate'));
    let endDateHdr = new Date(req.get('enddate'));

    console.log('convert to local date');
    console.log(convertUTCDateToLocalDate(startDateHdr));
    console.log(convertUTCDateToLocalDate(endDateHdr));



    let startDate = convertUTCDateToLocalDate(startDateHdr).toISOString().substring(0, 10) + ' '
                        + convertUTCDateToLocalDate(startDateHdr).toISOString().substring(11, 19);
    let endDate = convertUTCDateToLocalDate(endDateHdr).toISOString().substring(0, 10)
                        + ' ' + convertUTCDateToLocalDate(endDateHdr).toISOString().substring(11, 19);

    let params = [startDate, endDate, req.get('devices')];
    console.log(params);

    // if (req.get('devices') !== 'NODEVICES') {
    //     console.log("devices present");
    //     params = req.get('devices');

        let sql =   "SELECT * FROM powermonitoring.powerusage WHERE MeasurementTime" +
            " BETWEEN CAST('2020-02-05 23:45:00' AS DATETIME)" +
            " AND CAST('2020-02-06 2:00:00' AS DATETIME);";
    // }

    let sql2 =   "SELECT * FROM powermonitoring.powerusage WHERE MeasurementTime" +
        " BETWEEN CAST(? AS DATETIME)" +
        " AND CAST(? AS DATETIME);";


    let sql3 =  "SELECT * FROM powermonitoring.powerusage WHERE MeasurementTime" +
                " BETWEEN CAST(? AS DATETIME)" +
                " AND CAST(? AS DATETIME)" +
                " AND Device = ?;";

    // let devicesql = " AND Device = ?;";

    // let inserts = params;

    // console.log(mysql.format(sql, inserts));
    let sql3_format = mysql.format(sql3, params);

    console.log(sql3_format);

    con.query(sql3_format, function (err, result, fields) {
        // if (err) throw err;
        // console.log(result);
        console.log('Querying PowerUsage Table');
        res.send(result);
    });
    // console.log(myJSON);

});

module.exports = router;
