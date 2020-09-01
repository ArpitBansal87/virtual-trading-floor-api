const { login, signup, userList, logout } = require("./authentication");
const { getStocksList, setPosition, getPortfolio } = require("./stocks");
const {getStockSnapshot} = require('./route-handlers/stocks');

const httpEndPoints = {
  POST: {
    "/login": function (req, res, db) {
      login(req, res, db);
    },
    "/signUp": function (req, res, db) {
      signup(req, res, db);
    },
    "/setPosition": function (req, res, db) {
      setPosition(req, res, db);
    },    
    "/logout": function (req, res, db) {
      logout(req, res, db);
    },
  },
  GET: {
    "/userList": function (req, res, db) {
      userList(req, res, db);
    },
    "/getTopStocks": function (req, res, db) {
      getStockSnapshot(req, res, db);
    }
  },
};

const wsEndPoints = {
  "/stocks": function (req, res, db) {
    getStocksList(req, res, db);
  },
  "/userList": function (req, res, db) {
    userList(req, res, db);
  },
  "/portfolio": function (req, res, db) {
    getPortfolio(req, res, db)
  }
};

module.exports = {
  httpRoutes: httpEndPoints,
  wsRoutes: wsEndPoints,
};
