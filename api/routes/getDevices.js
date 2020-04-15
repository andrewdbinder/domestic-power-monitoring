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
    con.query("SELECT * FROM powermonitoring.devices", function (err, result, fields) {
        // if (err) throw err;
        // console.log(result);
        console.log('Querying Devices Table');

        // Call a function to generate packet
        // Send the generated packet
        // Receive the packet
        // send the packet as a http response

        res.send(result);
    });
    // console.log(myJSON);
});

module.exports = router;
