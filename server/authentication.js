const { RESPONSE_HEADERS } = require("./constants");
const concatStream = require("concat-stream");
const { getRequestBody } = require("./../utility/http-request-helper");

async function login(req, res, db) {
  res.writeHead(200, RESPONSE_HEADERS.CORS_ENABLED);
  let reqObj = await getRequestBody(req).then((data) => {
    return JSON.parse(data);
  });
  const userRef = await db.collection("users");
  const snapshot = await userRef
    .where("userName", "==", reqObj.userName)
    .where("password", "==", reqObj.password)
    .get();
  let responseObjValue = false;
  if (!snapshot.empty) {
    responseObjValue = true;
  }

  const responseObj = JSON.stringify({ isAuthenticated: responseObjValue });
  res.end(responseObj);
}

async function signup(req, res, db) {
  // const paramsList = getParamsList();
//   console.log("inside the login function");
  db.collection("").res.end({ isSignUpSuccessfull: true });
}

async function userList(req, res, db) {
  res.writeHead(200, RESPONSE_HEADERS.CORS_ENABLED);
//   console.log("Inside the userList Application");
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
//   console.log(responseObj);
  const bufferResponse = Buffer.from(responseObj);
  res.end(JSON.stringify({response: responseObj}));
}

// export {login, signup};
module.exports = { login, signup, userList };
