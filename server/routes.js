const { login, signup, userList } = require("./authentication");
const { getStocksList, setPosition } = require("./stocks");

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
  },
  GET: {
    "/userList": function (req, res, db) {
      userList(req, res, db);
    },
  },
};

const wsEndPoints = {
  "/stocks": function (req, res, db) {
    getStocksList(req, res, db);
  },
};

module.exports = {
  httpRoutes: httpEndPoints,
  wsRoutes: wsEndPoints,
};
