const { getRequestBody } = require("../utility/http-request-helper");
const { RESPONSE_HEADERS } = require("./constants");

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

async function setPosition(req, res, db) {
  const getReqBody = await getRequestBody(req).then((data) => {
    return JSON.parse(data);
  });
  await db
    .collection("positions")
    .add({
      stockIdentifier: getReqBody.stockSymbol,
      tradeCompleted: false,
      tradeQuantity: Number.parseInt(getReqBody.quantity),
      tradeType: getReqBody.tradeType,
      userIdentifier: getReqBody.userIdentifier,
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

module.exports = { getStocksList, setPosition };
