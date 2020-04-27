let mysql = require('mysql');

let db_config = {
    host: "localhost",
    user: "root",
    password: "lolo"
};


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

// exports.connect = connectToServer();
