let express = require('express');
let router = express.Router();
let powerDB = require('./config');
let mysql = require('mysql');

// For byte packing
let Struct = require('struct');

const net = require('net');
const port = powerDB.TCP_Port;
const host = powerDB.TCP_Host;

// Connect to DB
let connection = powerDB.connection;

// Handle server disconnects
powerDB.handleDisconnect(connection);

// Start TCP Server
const server = net.createServer();

server.listen(port, host, () => {
    console.log('TCP Server is running on port ' + port +'.');
});

// Array to hold connections in
let sockets = [];

// Constants for building packets
const PACKET_ID = 0xBA;
const VERSION_ID = 0;
const SUBTYPE = Object.freeze({
    "OPEN_CONNECTION": 0,
    "OPEN_RESPONSE": 1,
    "STATUS": 2,
    "STATUS_RESPONSE": 3,
    "DATA_DUMP": 4
});

// Handle HTTP requests
router.get('/', function (req, res) {
    // Two options, check available devices and ping device
    switch (req.get('action')) {
        // Checks whether a specified device is connected to the TCP server
        case 'checkavailable':
            if(sockets.length === 0) {
                // No sockets available => the requested device is not available
                res.send(false);
            } else {
                // Check if device exists in current sockets
                res.send(sockets.some(sock => sock.macAddress === req.get('device')));
            }
            break;
        // Pings a specified device to get more detailed usage information
        case 'pingdevice':
            console.log('Ping Device', req.get('device'));
            // Find the socket that holds the device we want, this request is only made when the front end knows
            // the device is available
            let sock = sockets[sockets.findIndex(Socket => Socket.macAddress === req.get('device'))];
            sendStatusResponse(sock);

            sock.setTimeout(5000, function() {
                try {
                    // Let the front end know the socket timed-out
                    res.send(['Socket Timeout'])
                }
                catch(ERR_HTTP_HEADERS_SENT) {
                    // Don't crash trying to timeout
                    // console.log('Socket Timeout Already Sent')
                }
            });

            sock.once('data', function (data) {
                // Build an object from the device ping response
                let packet = buildPacketObject(data);
                try {
                    // Send HTTP with JSON response object
                    res.send(packet);
                }
                catch(ERR_HTTP_HEADERS_SENT) {
                    // Don't crash trying to timeout
                    // console.log('Response already sent')
                }
            });
            break;
        default:
            break;
    }
});

// Handle new (unprompted) messages to server
server.on('connection', function(sock) {
    console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

    sock.setEncoding('hex');

    sock.on('data', function(data) {
        console.log('DATA ' + sock.macAddress + ': ' + data);
        let packet = buildPacketObject(data, sock);
        // Check if this packet is our type
        if (packet.PacketID === 0xba) {
            // Check version type
            if (packet.Version === 0) {
                switch (packet.PacketType) {
                    // On new connection from device, add the identifier to the socket and push to sockets array
                    case SUBTYPE.OPEN_CONNECTION:
                        // Identify and add to sockets list
                        sock.macAddress = packet.MACAddress;
                        sockets.push(sock);
                        // Build and send response packet
                        sendOpenConnectionResponse(sock);
                        break;
                    // This will only happen when requested, which sets up event listeners per requested device/socket
                    case SUBTYPE.STATUS_RESPONSE:
                        break;
                    // Data dump from device, send to database function
                    case SUBTYPE.DATA_DUMP:
                        sendDataToDatabase(packet);
                        break;
                    default:
                        break;
                }
            }
        }
    });

    // Add a 'close' event handler to this instance of socket
    sock.on('close', function() {
        let index = sockets.findIndex(function(o) {
            return o.remoteAddress === sock.remoteAddress && o.remotePort === sock.remotePort;
        });
        if (index !== -1) sockets.splice(index, 1);
        console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
    });

    // Log error instead of crashing
    sock.on('error', function(e) {
        console.log('Socket error:', e);
    });
});

// Generates a byte-packed packet to reply to new devices with
// Contains packet ID, version, packet subtype, and current local time in seconds since epoch
function sendOpenConnectionResponse(sock) {
    let date = new Date();
    let message = Struct()
        .word8('PACKET_ID')
        .word8('VERSION_ID')
        .word8('SUBTYPE')
        .word32Ube('TIME')  // big-endian for network!!
        .word8('end');

    // Allocate buffer for message
    message.allocate();
    let buf = message.buffer();

    let messageFields = message.fields;

    // Fill out message fields
    messageFields.PACKET_ID = PACKET_ID;
    messageFields.VERSION_ID = VERSION_ID;
    messageFields.SUBTYPE = SUBTYPE.OPEN_RESPONSE;
    messageFields.TIME = Math.floor(convertUTCDateToLocalDate(date).valueOf()/1000);

    // Send to socket
    sock.write(buf);
}

// Request status from device, sends packet with header and only subtype as a payload
function sendStatusResponse(sock) {
    let message = Struct()
        .word8('PACKET_ID')
        .word8('VERSION_ID')
        .word8('SUBTYPE')
        .word8('end');

    // Allocate buffer for message
    message.allocate();
    let buf = message.buffer();

    let messageFields = message.fields;

    // Fill out message fields
    messageFields.PACKET_ID = PACKET_ID;
    messageFields.VERSION_ID = VERSION_ID;
    messageFields.SUBTYPE = SUBTYPE.STATUS;

    // Write to socket/device
    sock.write(buf);
}

// Parse data dump from device
function sendDataToDatabase(data) {
    // Each sample will be handled with one SQL query
    let sql =  "INSERT INTO powermonitoring.powerusage (Device, MeasurementTime, WattValue) VALUES (?, ?, ?);";
    let DeviceID = data.DeviceID;

    // Loop over each sample from data
    data.Samples.forEach(sample => {
        let params = [];

        // Format time to SQL time B)
        let time = (sample.time).toISOString().substring(0, 10) + ' '
            + (sample.time).toISOString().substring(11, 19);

        // Fill out parameters for mysql.format
        params.push(DeviceID);
        params.push(time);
        params.push(sample.power);

        // Send query to database
        connection.query(mysql.format(sql, params));
    })
}

// Parse raw byte-packed data from devices into a more usable JSON object
function buildPacketObject(data, sock) {
    let packet = {};

    // Parse incoming data as string of hex
    packet.PacketID = parseInt("0x" + data.substring(0,2));
    packet.Version = parseInt("0x" + data.substring(2,4));
    packet.PacketType = parseInt("0x" + data.substring(4,6));

    // Handle each packet type differently/appropriately
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
        case SUBTYPE.DATA_DUMP:
            packet.DeviceID = sock.macAddress;
            packet.Samples = [];

            let i = 6;
            while (true) {
                // Loop over data until we see the end: (0 time, 0 Pmean)
                if (parseRawData(data.substring(i, i + 8), 'Time').valueOf() !== 0) {
                    let sample = {
                        time: parseRawData(data.substring(i, i + 8), 'Time'),
                        power: parseRawData(data.substring(i + 8, i + 12), 'Pmean')
                    };
                    // Push each sample on array
                    packet.Samples.push(sample);
                    i += 12;
                } else {
                    break;
                }
            }
            break;
        default:
            break;
    }

    // Return filled packet
    return packet;
}

// Parse raw byte-packed data from power monitoring IC appropriately
// All registers return 16-bits, signed and unsigned
function parseRawData(hex, reg) {
    switch (reg) {
        case 'Urms':
            // Unsigned XXX.XX
            return parseInt('0x' + hex)/100;
        case 'Pmean':
            // Signed kW, convert to W, treat as signed
            let Pmean = parseInt('0x' + hex, 16);
            if ((Pmean & 0x8000) > 0) {
                Pmean = Pmean - 0x10000;
            }
            return Pmean;
        case 'Freq':
            // Unsigned Hz
            return parseInt('0x' + hex)/100;
        case 'PowerF':
            // Signed X.XXX, treat as signed data
            let PowerF = parseInt('0x' + hex, 16);
            if ((PowerF & 0x8000) > 0) {
                PowerF = PowerF - 0x10000;
            }
            return PowerF/1000;
        case 'Time':
            return new Date(parseInt('0x' + hex)*1000);
        default:
            return -1;
    }
}


// Convert date to timezone shifted date
function convertUTCDateToLocalDate(date) {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
}

module.exports = router;
