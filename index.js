#!/usr/bin/env node

var app = require('./app');
var debug = require('debug')('language-playground-test12:server');
var http = require('http');
var WebSocket = require('ws');
var shell = require('shelljs');
var fs = require('fs');


/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port, () => {
  console.log(`Server started on port ${server.address().port}`);
});

server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

const wss = new WebSocket.Server({ server });

let open_web_socket = null;

wss.on('connection', function connection(ws) {
  open_web_socket = ws;
  // connection is up, let's add a simple server event
  ws.on('message', function incoming(message) {
    // log the received message and send it back to the client
    let data = JSON.parse(message);
    console.log("Data: " + data.type);
    console.log((new Date()) + ' - Received: %s', message);
    ws.send(`Hello, you sent -> ${message}`);
    execution_test(message);
  });
  ws.on('code', function codeSent(message) {
    console.log('Code submitted: ' + message);
  });

  // send immediately a feedback to the imcoming connection
  ws.send('Hi there, I am a WebSocket server');
});

wss.onclose = function(event) {
  console.log("WebSocket is closed now.");
  open_web_socket = false;
};

function execution_test(code) {
  console.log("Executing test");
  var out = null;
  fs.writeFile('test.js', code, (error) => {
    if(error)
    {
      console.log('Error: ' + error);
      throw error;
    }
  });
  shell.exec('node test.js', {async:true}, (code, output) => {
    out = output;
  });
  console.log("Out from shell: " + JSON.stringify(out));
  return out;
};