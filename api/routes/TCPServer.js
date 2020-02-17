let express = require('express');
let router = express.Router();

const net = require('net');
const port = 7060;
const host = '192.168.1.102';

const server = net.createServer();

server.listen(port, host, () => {
    console.log('TCP Server is running on port ' + port +'.');
});

let sockets = [];

server.on('connection', function(sock) {
    console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);
    sockets.push(sock);

    sock.on('data', function(data) {
        console.log('DATA ' + sock.remoteAddress + ': ' + data);
        // Write the data back to all the connected, the client will receive it as data from the server
        // sockets.forEach(function(sock, index, array) {
        //     sock.write(sock.remoteAddress + ':' + sock.remotePort + " said " + data + '\n');
            // sock.write('My name is Andrew' + '\n');
        // });
        // console.log(sock);
    });

    // Add a 'close' event handler to this instance of socket
    sock.on('close', function(data) {
        let index = sockets.findIndex(function(o) {
            return o.remoteAddress === sock.remoteAddress && o.remotePort === sock.remotePort;
        })
        if (index !== -1) sockets.splice(index, 1);
        console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
    });

    sock.on('error', function(e) {
        console.log('Socket error:', e);
    });
});

router.get('/', function (req, res, next) {

    if (sockets[0]) {
        console.log('Listening to sockets[0]: ' + sockets[0].remoteAddress);
        // sockets.forEach(function(sock, index, array) {
        // sockets[0].write('I once again asking for your API response: ' + '\n');
        sockets[0].write('0' + '\0');
        console.log('Sent ' + sockets[0].remoteAddress + ' 0');
        sockets[0].once('data', function (data) {
            console.log('DATA ' + sockets[0].remoteAddress + ': ' + data);
            console.log(data);
            // sockets[0].setTimeout(3000);
            // sockets[0].once('timeout', () => {
            //     console.log('SocketTimeout');
            //     res.send('Socket timeout');
            //     sockets[0].end();
            // });
            res.send(String(data).replace('\0', ''));
        });

    } else {
        res.send('No socket open');
    }
    // });
});

module.exports = router;
