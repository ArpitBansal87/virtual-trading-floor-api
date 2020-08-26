// import { login, signup } from "./authentication";
const {login, signup, userList} = require('./authentication');
const { getStocksList } = require('./stocks');

const httpEndPoints = {
    'POST': {
        '/login': function(req, res, db) {
            console.log('inside the routes file');
            login(req, res, db);
        },
        '/signUp': function(req, res, db) {
            console.log('inside the routes file');
            signup(req, res, db);
        }
    },
    'GET': {
        '/userList': function(req, res, db) {
            console.log('inside the routes file for Get call');
            userList(req, res, db);
        }
    }
}

const wsEndPoints = {
    '/stocks': function(req, res, db) {
        console.log('inside the routes file for ws stocks call');
        getStocksList(req, res, db);
    }
}

module.exports = {
    httpRoutes: httpEndPoints,
    wsRoutes: wsEndPoints
}