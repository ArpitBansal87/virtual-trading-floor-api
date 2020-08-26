const { RESPONSE_HEADERS } = require("./constants");
const { getRequestBody } = require("./../utility/http-request-helper");

async function login(req, res, db) {
  let reqObj = await getRequestBody(req).then((data) => {
    return JSON.parse(data);
  });
  const userRef = await db.collection("users");
  const snapshot = await userRef
    .where("userName", "==", reqObj.userName)
    .where("password", "==", reqObj.password)
    .get();
  let responseObjValue = false;
  let responseOb = '';
  if (!snapshot.empty) {
    snapshot.forEach((element) => {
      responseOb = element.id;
    });
    responseObjValue = true;
  }

  const responseObj = JSON.stringify({ isAuthenticated: responseObjValue, userIdentifier: responseOb });
  res.writeHead(200, RESPONSE_HEADERS.CORS_ENABLED);
  res.end(responseObj);
}

async function signup(req, res, db) {
  db.collection("").res.end({ isSignUpSuccessfull: true });
}

async function userList(req, res, db) {
  res.writeHead(200, RESPONSE_HEADERS.CORS_ENABLED);
  const userRef = await db.collection("users");
  const snapshot = await userRef.get();
  let responseObj = [];
  if (snapshot.empty) {
    responseObj = [];
  } else {
    snapshot.forEach((element) => {
      responseObj.push(element.data());
    });
  }
  res.end(JSON.stringify({response: responseObj}));
}

module.exports = { login, signup, userList };
