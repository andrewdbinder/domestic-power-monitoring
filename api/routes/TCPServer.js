let express = require('express');
let router = express.Router();

// For byte packing
let Struct = require('struct');

const net = require('net');
const port = 7060;
const host = '192.168.1.218';

const server = net.createServer();

server.listen(port, host, () => {
    console.log('TCP Server is running on port ' + port +'.');
});

let sockets = [];

const PACKET_ID = 0xBA;
const VERSION_ID = 0;

const SUBTYPE = Object.freeze({
    "OPEN_CONNECTION": 0,
    "OPEN_RESPONSE": 1,
    "STATUS": 2,
    "STATUS_RESPONSE": 3,
    "DATA_DUMP": 4
})


server.on('connection', function(sock) {
    console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

    sock.setEncoding('hex');

    sock.on('data', function(data) {
        console.log('DATA ' + sock.macAddress + ': ' + data);
        let packet = buildPacketObject(data);
        // Check if this packet is our type
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
    let message = Struct()
        .word8('PACKET_ID')
        .word8('VERSION_ID')
        .word8('SUBTYPE')
        .word32Ube('TIME')
        .word8('test');


    message.allocate();
    let buf = message.buffer();

    let messageFields = message.fields;

    messageFields.PACKET_ID = PACKET_ID;
    messageFields.VERSION_ID = VERSION_ID;
    messageFields.SUBTYPE = SUBTYPE.OPEN_RESPONSE;
    messageFields.TIME = Math.floor(convertUTCDateToLocalDate(date).valueOf()/1000);

    sock.write(buf);
    // sock.write(PACKET_ID + VERSION_ID + SUBTYPE.OPEN_RESPONSE + (Math.floor(convertUTCDateToLocalDate(date).valueOf()/1000)).toString());
}

function send_status_request(sock) {
    let message = Struct()
        .word8('PACKET_ID')
        .word8('VERSION_ID')
        .word8('SUBTYPE')
        .word8('test');


    message.allocate();
    let buf = message.buffer();

    let messageFields = message.fields;

    messageFields.PACKET_ID = PACKET_ID;
    messageFields.VERSION_ID = VERSION_ID;
    messageFields.SUBTYPE = SUBTYPE.STATUS;

    sock.write(buf);
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
            packet.PMean = parseRawData(data.substring(6,10), 'Pmean');
            packet.Urms = parseRawData(data.substring(10,14), 'Urms');
            packet.PowerFactor = parseRawData(data.substring(14,18), 'PowerF');
            packet.Frequency = parseRawData(data.substring(18,22), 'Freq');
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
            send_status_request(sock);

            sock.setTimeout(5000, function() {
                try {
                    res.send(['Socket Timeout'])
                }
                catch(ERR_HTTP_HEADERS_SENT) {
                    // console.log('Socket Timeout Already Sent')
                }
            });

            sock.once('data', function (data) {
                let packet = buildPacketObject(data);
                try {
                    res.send(packet);
                }
                catch(ERR_HTTP_HEADERS_SENT) {
                    // console.log('Response already sent')
                }
            });
            break;
        default:
            break;
    }
});

function parseRawData(hex, reg) {
    switch (reg) {
        case 'Urms':
            // Unsigned XXX.XX
            return parseInt('0x' + hex)/100;
        case 'Pmean':
            // Signed kW, convert to W
            return intToUint(parseInt('0x' + hex), 16)/1000;
        case 'Freq':
            // Unsigned Hz
            return parseInt('0x' + hex)/100;
        case 'PowerF':
            // Signed X.XXX
            return intToUint(parseInt('0x' + hex), 16)/1000;
        default:
            return -1;
    }
}

// Code from Paul S. on stackoverflow
function intToUint(int, nbit) {
    var u = new Uint32Array(1);
    nbit = +nbit || 32;
    if (nbit > 32) throw new RangeError('intToUint only supports ints up to 32 bits');
    u[0] = int;
    if (nbit < 32) { // don't accidentally sign again
        int = Math.pow(2, nbit) - 1;
        return u[0] & int;
    } else {
        return u[0];
    }
}

function convertUTCDateToLocalDate(date) {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
}

module.exports = router;
