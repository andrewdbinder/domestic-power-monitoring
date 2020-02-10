var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require("cors");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var testAPIRouter = require("./routes/testAPI");
var getDevices = require("./routes/getDevices");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/testAPI", testAPIRouter);
app.use("/getDevices", getDevices);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const net = require('net');
const port = 7060;
const host = '127.0.0.1';

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
    sockets.forEach(function(sock, index, array) {
      sock.write(sock.remoteAddress + ':' + sock.remotePort + " said " + data + '\n');
    });
  });

  // Add a 'close' event handler to this instance of socket
  sock.on('close', function(data) {
    let index = sockets.findIndex(function(o) {
      return o.remoteAddress === sock.remoteAddress && o.remotePort === sock.remotePort;
    })
    if (index !== -1) sockets.splice(index, 1);
    console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
  });
});



module.exports = app;
