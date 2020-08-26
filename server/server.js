const endPoints = require("./routes");
const path = require("path");
const WebSocket = require("ws");
const http = require("http");
const { createReadStream } = require("fs");
const admin = require("firebase-admin");
const serviceAccount = require("../env/serviceAccountKey.json");
//initialize admin SDK using serciceAcountKey
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();
const httpport = 8081;
const { RESPONSE_HEADERS } = require("./constants");

const stocksConnectionList = {};

const httpserver = http.createServer((req, res) => {
  try {
    if (req.url === "/") {
      createReadStream(path.resolve("./server/index.html")).pipe(res);
    }

    const url = req.url;
    const method = req.method;
    if (method in endPoints.httpRoutes) {
      if (url in endPoints.httpRoutes[method]) {
        endPoints.httpRoutes[method][url](req, res, db);
      } else {
        res.writeHead(500, RESPONSE_HEADERS.CORS_ENABLED);
        res.end("Unhandled URL passed");
      }
    } else {
      res.writeHead(500, RESPONSE_HEADERS.CORS_ENABLED);
      res.end("Unhandled METHOD passed");
    }
  } catch (err) {
    console.error(`ERROR =====>>>> ${err}`);
    res.writeHead(500, RESPONSE_HEADERS.CORS_ENABLED);
    res.end("Internal server error");
  }
});

const wsServer = new WebSocket.Server({ server: httpserver });

wsServer.on("connection", function (client, req) {
  console.log("New WS Connection");

  const url = req.url;
  if (url in endPoints.wsRoutes) {
    endPoints.wsRoutes[url](client, db);
  }

  client.on("message", function (msg) {
    console.log(`msg: ${msg}`);
  });
});
httpserver.listen(process.env.PORT || httpport);
console.log(`Server is listening on Port: ${httpport}`);
