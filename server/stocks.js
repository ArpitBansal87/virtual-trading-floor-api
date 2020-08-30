const { getRequestBody, getParams } = require("../utility/http-request-helper");
const { RESPONSE_HEADERS } = require("./constants");
const admin = require("firebase-admin");

async function getStocksList(client, db) {
  const stockRef = await db.collection("stocks");
  stockRef.onSnapshot(
    (querySnapshot) => {
      let responseObj = [];
      if (querySnapshot.empty) {
        responseObj = [];
      } else {
        querySnapshot.forEach((element) => {
          responseObj.push(element.data());
        });
      }

      client.send(JSON.stringify({ response: responseObj }));
    },
    (err) => {
      console.log(`Encountered error: ${err}`);
    }
  );
}

async function getPortfolio(client, db, req) {
  console.log('inside the portfolio');
  let reqObj = await getParams(req);
  await db.collection('positions')
  .where("userIdentifier", "==", reqObj.userIdentifier)
  .onSnapshot(response => {
    let returnObj = { response: []};
    let responseObj = [];
    if(!response.empty) {      
      response.forEach(stock => {
        responseObj.push(stock.data());
      })
    }
    returnObj.response = responseObj
    client.send(JSON.stringify(returnObj))
  })

}

async function setPosition(req, res, db) {
  const getReqBody = await getRequestBody(req).then((data) => {
    return JSON.parse(data);
  });

  //TODO: simplify the whole process
  const positionSnapshot = await db
    .collection("positions")
    .where("userIdentifier", "==", getReqBody.userIdentifier)
    .where("stockIdentifier", "==", getReqBody.stockSymbol)
    .get();
  if (!positionSnapshot.empty) {
    let currentData = {};
    let currentElementId = "";
    positionSnapshot.forEach((ele) => {
      currentData = ele.data();
      currentElementId = ele.id;
    });
    const newData = {
      tradeQuantity:
        getReqBody.tradeType === "BUY"
          ? Number.parseInt(currentData.tradeQuantity) +
            Number.parseInt(getReqBody.quantity)
          : Number.parseInt(currentData.tradeQuantity) -
            Number.parseInt(getReqBody.quantity),
      avgPrice:
        getReqBody.tradeType === "BUY"
          ? (Number.parseInt(currentData.tradeQuantity) *
              Number.parseInt(currentData.avgPrice) +
              Number.parseInt(getReqBody.quantity) *
                Number.parseInt(getReqBody.buyPrice)) /
            (Number.parseInt(currentData.tradeQuantity) +
              Number.parseInt(getReqBody.quantity))
          : (Number.parseInt(currentData.tradeQuantity) *
              Number.parseInt(currentData.avgPrice) -
              Number.parseInt(getReqBody.quantity) *
                Number.parseInt(getReqBody.buyPrice)) /
            (Number.parseInt(currentData.tradeQuantity) -
              Number.parseInt(getReqBody.quantity)),
    };
    if (newData.tradeQuantity < 1) {
      await db
        .collection("positions")
        .doc(currentElementId)
        .delete()
        .then(() => {
          res.writeHead(201, RESPONSE_HEADERS.CORS_ENABLED);
          res.end(JSON.stringify({ positionUpdated: true }));
        })
        .catch(() => {
          res.writeHead(500, RESPONSE_HEADERS.CORS_ENABLED);
          res.end(JSON.stringify({ positionUpdated: false }));
        });
    }
    await db
      .collection("positions")
      .doc(currentElementId)
      .update({
        tradeQuantity: newData.tradeQuantity,
        avgPrice: newData.avgPrice,
      })
      .then(() => {
        res.writeHead(201, RESPONSE_HEADERS.CORS_ENABLED);
        res.end(JSON.stringify({ positionUpdated: true }));
      })
      .catch(() => {
        res.writeHead(500, RESPONSE_HEADERS.CORS_ENABLED);
        res.end(JSON.stringify({ positionUpdated: false }));
      });
  } else {
    await db
      .collection("positions")
      .doc(getReqBody.userIdentifier+'-'+getReqBody.stockSymbol)
      .set({
        stockIdentifier: getReqBody.stockSymbol,
        tradeQuantity: Number.parseInt(getReqBody.quantity),
        userIdentifier: getReqBody.userIdentifier,
        avgPrice: getReqBody.buyPrice,
        currentPrice: getReqBody.buyPrice,
      })
      .then(() => {
        res.writeHead(201, RESPONSE_HEADERS.CORS_ENABLED);
        res.end(JSON.stringify({ positionUpdated: true }));
      })
      .catch(() => {
        res.writeHead(500, RESPONSE_HEADERS.CORS_ENABLED);
        res.end(JSON.stringify({ positionUpdated: false }));
      });
  }

  db.collection("exchange").add({
    stockIdentifier: getReqBody.stockSymbol,
    tradeCompleted: false,
    tradeQuantity: Number.parseInt(getReqBody.quantity),
    tradeType: getReqBody.tradeType,
    userIdentifier: getReqBody.userIdentifier,
    totalShares: getReqBody.totalShares,
    price: getReqBody.buyPrice
  });

  let stockId = "";
  const stockRef = await db
    .collection("stocks")
    .where("symbol", "==", getReqBody.stockSymbol)
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
      totalShares: admin.firestore.FieldValue.increment(
        getReqBody.tradeType === "BUY"
          ? -Math.abs(Number.parseInt(getReqBody.quantity))
          : Math.abs(Number.parseInt(getReqBody.quantity))
      ),
    });
}

module.exports = { getStocksList, setPosition, getPortfolio };
