let mysql = require('mysql');

// Configure DB connection here
// Never use root to connect to database lol
let db_config = {
    host: "localhost",
    user: "root",
    password: "lolo"
};

// Configure TCP server Here
const port = 7060;
const host = '192.168.1.218';




// Exports used in other files
exports.TCP_Port = port;
exports.TCP_Host = host;

exports.connectToServer = () => {
    let connection = mysql.createConnection(db_config);

    connection.connect(function(err) {
        if(err) {
            console.log('error when connecting to db:', err);
            setTimeout(connectToServer, 2000); // We introduce a delay before attempting to reconnect
        }
    });

    connection.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') {
            connectToServer();
        } else {
            throw err;
        }
    });

    return connection;
};
