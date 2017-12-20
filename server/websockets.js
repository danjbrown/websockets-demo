'use strict';

// websocket and http servers
const webSocket = require('websocket').server;
const entities        = require('html-entities').AllHtmlEntities;
const http            = require('http');

// defaults
let messageHistory   = [];
let connectedClients = [];

// websocket server port
const port = 8081;

const server = http.createServer((request, response) => {
});

server.listen(port, () => {
    console.log('Server is listening on port', port);
});

// create the websocket server
const webSocketServer  = new webSocket({
    httpServer : server
});

// requested every time a client attempts to connect
webSocketServer.on('request', (request) => {
    console.log('Client connection from origin', request.origin);

    const connection = request.accept(null, request.origin);
    console.log('Connection accepted');

    const index = connectedClients.push(connection) - 1;

    // after a new connection, send the entire message history to the client
    if (messageHistory.length > 0) {
        connection.sendUTF(JSON.stringify({ type : 'allMessages', data : messageHistory }));
    }

    // client has sent a new message
    connection.on('message', (message) => {
        if (message.type === 'utf8') {
            console.log('Received message', message.utf8Data, 'from remote address', connection.remoteAddress);

            // add the new message to the history
            const newMessage = {
                id   : connection.remoteAddress,
                time : (new Date()).getTime(),
                text : entities.encode(message.utf8Data)
            };
            messageHistory.push(newMessage);
            messageHistory = messageHistory.slice(-200);

            // send the new message to ALL the connected clients
            const json = JSON.stringify({ type : 'newMessage', data : newMessage });
            for (let i = 0; i < connectedClients.length; i++) {
                connectedClients[i].sendUTF(json);
            }
        }
    });

    // client has disconnected
    connection.on('close', (reasonCode, description) => {
        console.log('Client disconnected', reasonCode, description);
    });
});