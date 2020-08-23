const path = require('path');
const WebSocket = require('ws');
const http = require('http');
const { createReadStream } = require('fs');

const httpport = 8081;
const SSE_RES_HEADERS = {
    'Connection': 'keep-alive',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache'
};

function sendSSEResponse(res, event, data) {
    if(event) {
        res.write(`event: ${event}\n`);
    }

    if(data) {
        res.write(`data: ${data}\n\n`);
    }
}

const httpserver = http.createServer( (req, res) => {

    if(req.url === '/') {
        createReadStream(path.resolve('./server/index.html')).pipe(res);
    }

    if(req.url === '/login') {
        console.log('server login call initiated');
        res.end('User Login Call');
    }

    if(req.url === '/sse') {
        console.log('Sending SSE');
        res.writeHead(200, SSE_RES_HEADERS);

        sendSSEResponse(res, 'initial', "hello, I am from SSE");
    }
});

const wsServer = new WebSocket.Server({server: httpserver});


wsServer.on('connection', function(client) {
    console.log('New WS Connection');

    client.on('message', function(msg) {
        console.log(`msg: ${msg}`);
    })

    client.send('Hello');
})
httpserver.listen(process.env.PORT || httpport);
console.log(`Server is listening on Port: ${httpport}`);