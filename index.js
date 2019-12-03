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
let sendMessage = null;

wss.on('connection', function connection(ws) {
  open_web_socket = ws;
  // connection is up, let's add a simple server event
  ws.on('message', function incoming(message) {
    // log the received message and send it back to the client
    let data = JSON.parse(message);
    console.log("Data: " + data.type);
    if(data.type.match("intro"))
    {
      console.log("Welcoming connection");
    }
    else
    {
      console.log((new Date()) + ' - Received: %s', message);
      let formatMessage = JSON.stringify({type: 'message', message: `Hello, you sent -> ${message}`});
      ws.send(formatMessage);
      runCode(data);
    }
  });
  ws.on('code', function codeSent(message) {
    console.log('Code submitted: ' + message);
  });

  sendMessage = function(message) {
    if(open_web_socket != null && open_web_socket !== false)
    {
      ws.send(message);
    }
  };
  // send immediately a feedback to the incoming connection
  ws.send(JSON.stringify({type: 'message', message: 'Hi there, I am a WebSocket server'}));
});

wss.onclose = function(event) {
  console.log("WebSocket is closed now.");
  open_web_socket = false;
};

function runCode(data)
{
  if(data.type.match("code"))
  {
    execution_test(data.data)
  }
}

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
  shell.exec('node test.js', {async:true}, (code, stdout, stderr) => {
    let output = { type: "out", out: stdout, code: code, err: stderr };
    sendMessage(JSON.stringify(output));
  });
  console.log("Out from shell: " + JSON.stringify(out));
  return out;
};
