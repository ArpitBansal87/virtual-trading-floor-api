const {
  RESPONSE_HEADERS,
  ROUTE_END_POINTS,
  STOCK_FIELD_NAMES,
} = require("../constants");

const getStockSnapshot = async (req, res, db) => {
  const stockDBRef = db.collection(ROUTE_END_POINTS.STOCKS);
  const getTop5Stocks = await stockDBRef
    .orderBy(STOCK_FIELD_NAMES.COMPANYNAME)
    .limit(5)
    .get();
  if (getTop5Stocks.empty) {
    res.writeHead(201, RESPONSE_HEADERS.CORS_ENABLED);
    res.end(JSON.stringify({ response: [] }));
  }
  let responseObj = [];
  getTop5Stocks.forEach((stock) => {
    responseObj.push(stock.data());
  });
  res.writeHead(200, RESPONSE_HEADERS.CORS_ENABLED);
  res.end(JSON.stringify({ response: responseObj }));
};

module.exports = { getStockSnapshot };
