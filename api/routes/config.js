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

exports.db_config = db_config;

exports.connection = mysql.createConnection(db_config);

exports.handleDisconnect = (conn) => {
    conn.on('error', function(err) {
        if (!err.fatal) {
            return;
        }

        if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
            throw err;
        }

        console.log('Re-connecting lost connection: ' + err.stack);

        exports.connection = mysql.createConnection(db_config);
        handleDisconnect(exports.connection);
        exports.connection.connect();
    });

    return exports.connection;
};