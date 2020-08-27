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

    const urlObj = req.url.split('?');
    const url = urlObj[0];
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

// function to periodically change the price for shares.
// setInterval(() => {
setTimeout(() => {
  let tradeIDList = [];
  let totalSharesTraded = 0;
  let tradeDataList = {};
  db.collection("exchange")
    .get()
    .then(async (data) => {
      if (!data.empty) {
        data.forEach((element) => {
          tradeIDList.push(element.id);
          const elementData = element.data();
          if (elementData.stockIdentifier in tradeDataList) {
            tradeDataList[elementData.stockIdentifier] =
              elementData.tradeType === "SELL"
                ? {
                    ...tradeDataList[elementData.stockIdentifier],
                    sell:
                      tradeDataList[elementData.stockIdentifier].sell +
                      elementData.tradeQuantity,
                  }
                : {
                    ...tradeDataList[elementData.stockIdentifier],
                    buy:
                      tradeDataList[elementData.stockIdentifier].buy +
                      elementData.tradeQuantity,
                  };
          } else {
            tradeDataList[elementData.stockIdentifier] = {
              sell:
                elementData.tradeType === "SELL"
                  ? elementData.tradeQuantity
                  : 0,
              buy:
                elementData.tradeType === "BUY" ? elementData.tradeQuantity : 0,
              price: elementData.price,
              totalShares: elementData.totalShares,
            };
          }
        });
      }
      console.log(JSON.stringify(tradeDataList));
      for (stock in tradeDataList) {
        const newPrice =
          tradeDataList[stock]["price"] -
          (tradeDataList[stock]["sell"] / tradeDataList[stock]["totalShares"]) *
            tradeDataList[stock]["price"] +
          (tradeDataList[stock]["buy"] / tradeDataList[stock]["totalShares"]) *
            tradeDataList[stock]["price"];
            console.log(newPrice);
        let stockId = "";
        const stockRef = await db
          .collection("stocks")
          .where("symbol", "==", stock)
          .get();
        if (!stockRef.empty) {
          stockRef.forEach((element) => {
            stockId = element.id;
          });
        }
        await db
          .collection("stocks")
          .doc(stockId)
          .update({
            sharePrice: newPrice.toFixed(3).toString(),
          });

          //changes for positions modification
          let positionsStockIDs = [];
        const positionsRef = await db
          .collection("positions")
          .where("stockIdentifier", "==", stock)
          .get();
        if (!positionsRef.empty) {
          positionsRef.forEach((element) => {
            positionsStockIDs.push(element.id);
          });
        }
        positionsStockIDs.forEach(symbolVal => {
          db
          .collection("positions")
          .doc(symbolVal)
          .update({
            currentPrice: newPrice.toFixed(3).toString(),
          });
        })
        
          
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(async () => {
      for (deleteItem in tradeIDList) {
        await db
          .collection("exchange")
          .doc(tradeIDList[deleteItem])
          .delete()
          .then((data) => {
            console.log(`delete successfull ${tradeIDList[deleteItem]}`);
          })
          .catch((err) => console.log(err));
      }
    });
}, 10000);
