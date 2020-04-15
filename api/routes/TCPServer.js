let express = require('express');
let router = express.Router();

const net = require('net');
const port = 7060;
const host = '192.168.1.218';

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
        });
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
        // console.log(JSON.stringify(req.headers));
        // console.log(JSON.stringify(req.get('data')));
        sockets[0].write(req.get('data') + '\0');
        sockets[0].setTimeout(5000, function(){
            try {
                res.send('Socket Timeout');
            }
            catch(ERR_HTTP_HEADERS_SENT) {
                console.log('Header already sent')
            }
        //     // sockets[0].end();
        });

        console.log('Sent ' + sockets[0].remoteAddress + ' 0');
        sockets[0].once('data', function (data) {
            // console.log('DATA ' + sockets[0].remoteAddress + ': ' + data);
            console.log(data);
            // sockets[0].setTimeout(3000);
            // sockets[0].once('timeout', () => {
            //     console.log('SocketTimeout');
            //     res.send('Socket timeout');
            //     sockets[0].end();
            // });
            try {
                res.send(String(data).replace('\0', '').replace('\n', ''));
            }
            catch(ERR_HTTP_HEADERS_SENT) {
                console.log('Header already sent')
            }
        });

    } else {
        res.send('No socket open');
    }
    // });
});

module.exports = router;
