const RESPONSE_HEADERS = {
  CORS_ENABLED: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
};
const ROUTE_END_POINTS = {
  STOCKS: 'stocks',
  HOLDINGS: 'position',
};

const STOCK_FIELD_NAMES = {
  COMPANYNAME: 'companyName',
}

module.exports = {
  RESPONSE_HEADERS,
  ROUTE_END_POINTS,
  STOCK_FIELD_NAMES
};
