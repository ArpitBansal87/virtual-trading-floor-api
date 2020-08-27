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
  let responseOb = "";
  if (!snapshot.empty) {
    snapshot.forEach((element) => {
      responseOb = element.id;
    });
    responseObjValue = true;
  }

  const responseObj = JSON.stringify({
    isAuthenticated: responseObjValue,
    userIdentifier: responseOb,
  });
  res.writeHead(200, RESPONSE_HEADERS.CORS_ENABLED);
  res.end(responseObj);
}

async function signup(req, res, db) {
  let reqObj = await getRequestBody(req).then((data) => {
    return JSON.parse(data);
  });
  const userRef = await db.collection("users").add({
    firstName: reqObj.firstName,
    lastName: reqObj.lastName,
    isLoggedIn: false,
    funds:2500,
    userName: reqObj.userName,
    password: reqObj.password
  });
  
  res.writeHead(201, RESPONSE_HEADERS.CORS_ENABLED);
  res.end(JSON.stringify({ isUserSignUpSuccessfull: true}));
}

async function userList(client, db) {
  // res.writeHead(200, RESPONSE_HEADERS.CORS_ENABLED);
  const userRef = await db.collection("users");
  userRef.onSnapshot(
    (querySnapshot) => {
      let responseObj = [];
      if (querySnapshot.empty) {
        responseObj = [];
      } else {
        querySnapshot.forEach(async (element) => {
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

module.exports = { login, signup, userList };
