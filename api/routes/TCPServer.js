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

const PACKET_ID = "BA";
const VERSION_ID = "0";

const SUBTYPE = Object.freeze({
    "OPEN_CONNECTION": 0,
    "OPEN_RESPONSE": 1,
    "STATUS": 2,
    "STATUS_RESPONSE": 3,
    "DATA_DUMP": 4
})


server.on('connection', function(sock) {
    let date = new Date();
    console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

    sock.setEncoding('hex');

    sock.on('data', function(data) {
        console.log('DATA ' + sock.macAddress + ': ' + data);
        // data_string += data;
        // Check if this packet is our type
        let packet = buildPacketObject(data);
        // console.log(JSON.stringify(packet));
        if (packet.PacketID === 0xba) {
            // Check version type
            if (packet.Version === 0) {
                switch (packet.PacketType) {
                    case SUBTYPE.OPEN_CONNECTION:
                        // Identify and add to sockets list
                        sock.macAddress = packet.MACAddress;
                        sockets.push(sock);
                        // console.log(sock);
                        // Build and send return packet
                        send_open_response(sock);
                        break;
                    case SUBTYPE.STATUS_RESPONSE:
                        console.log(JSON.stringify(packet));
                        break;
                    case SUBTYPE.DATA_DUMP:
                        break;
                    default:
                        break;
                }
            }
        }
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

function send_open_response(sock) {
    let date = new Date();
    sock.write(PACKET_ID + VERSION_ID + SUBTYPE.OPEN_RESPONSE + (Math.floor(convertUTCDateToLocalDate(date).valueOf()/1000)).toString());
}

function buildPacketObject(data) {
    let packet = {};

    packet.PacketID = parseInt("0x" + data.substring(0,2));
    packet.Version = parseInt("0x" + data.substring(2,4));
    packet.PacketType = parseInt("0x" + data.substring(4,6));

    switch (packet.PacketType) {
        case SUBTYPE.OPEN_CONNECTION:
            packet.MACAddress = data.substring(6);
            break;
        case SUBTYPE.STATUS_RESPONSE:
            packet.PMean = parseInt("0x" + data.substring(6,10))/1000;
            console.log(packet.PMean);
            packet.Urms = parseFloat(parseInt("0x" + data.substring(10,12)) + '.' + parseInt("0x" + data.substring(12,14)));
            packet.PowerFactor = parseFloat(parseInt("0x" + data.substring(14,16)) + '.' + parseInt("0x" + data.substring(16,18)));
            packet.Frequency = parseFloat(parseInt("0x" + data.substring(18,20)) + '.' + parseInt("0x" + data.substring(20,22)));
            break;
        default:
            break;
    }

    return packet;
}



router.get('/', function (req, res, next) {
    switch (req.get('action')) {
        case 'checkavailable':
            if(sockets.length === 0) {
                res.send(false);
            } else {
                // Check if device exists in current sockets
                res.send(sockets.some(sock => sock.macAddress === req.get('device')));
            }
            // console.log(sockets.some(sock => sock.macAddress === req.get('device')));
            break;
        case 'pingdevice':
            console.log('Ping Device', req.get('device'));
            // console.log(sockets.findIndex(Socket => Socket.macAddress === req.get('device')));
            let sock = sockets[sockets.findIndex(Socket => Socket.macAddress === req.get('device'))];
            sock.write(PACKET_ID + VERSION_ID + SUBTYPE.STATUS);
            sock.setTimeout(5000, function() {
                try {
                    res.send(['Socket Timeout'])
                }
                catch(ERR_HTTP_HEADERS_SENT) {
                    console.log('Socket Timeout Already Sent')
                }
            });

            console.log('Sent ' + sock.macAddress + ' 2');
            sock.once('data', function (data) {
                let packet = buildPacketObject(data);
                try {
                    res.send(packet);
                }
                catch(ERR_HTTP_HEADERS_SENT) {
                    console.log('Response already sent')
                }
            });
            break;
        default:
            break;
    }

    // if (sockets[0]) {
    //     console.log('Listening to sockets[0]: ' + sockets[0].remoteAddress + ' with Device ID: ' + sockets[0].identifier);
    //     // sockets.forEach(function(sock, index, array) {
    //     // sockets[0].write('I once again asking for your API response: ' + '\n');
    //     // console.log(JSON.stringify(req.headers));
    //     // console.log(JSON.stringify(req.get('data')));
    //     // sockets[0].write(req.get('data') + '\0');
    //     sockets[0].write(PACKET_ID + VERSION_ID + SUBTYPE.STATUS);
    //
    //     sockets[0].setTimeout(5000, function(){
    //         try {
    //             res.send('Socket Timeout');
    //         }
    //         catch(ERR_HTTP_HEADERS_SENT) {
    //             console.log('Header already sent')
    //         }
    //     //     // sockets[0].end();
    //     });
    //
    //     console.log('Sent ' + sockets[0].remoteAddress + ' 0');
    //     sockets[0].once('data', function (data) {
    //         // console.log('DATA ' + sockets[0].remoteAddress + ': ' + data);
    //         let packet = buildPacketObject(data);
    //         // console.log(JSON.stringify(packet));
    //         // sockets[0].setTimeout(3000);
    //         // sockets[0].once('timeout', () => {
    //         //     console.log('SocketTimeout');
    //         //     res.send('Socket timeout');
    //         //     sockets[0].end();
    //         // });
    //         try {
    //             res.send(packet);
    //         }
    //         catch(ERR_HTTP_HEADERS_SENT) {
    //             console.log('Header already sent')
    //         }
    //     });
    //
    // } else {
    //     res.send('No socket open');
    // }
    // });
});

function convertUTCDateToLocalDate(date) {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
}

module.exports = router;
