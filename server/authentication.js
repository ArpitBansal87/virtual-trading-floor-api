const { RESPONSE_HEADERS } = require("./constants");
const { getRequestBody } = require("./../utility/http-request-helper");

async function logout(req, res, db) {
  let reqObj = await getRequestBody(req).then((data) => {
    return JSON.parse(data);
  });
  const userRef = await db.collection("users");
  await userRef
    .doc(reqObj.id)
    .update({
      isLoggedIn: false,
    })
    .then(() => {
      res.writeHead(200, RESPONSE_HEADERS.CORS_ENABLED);
      res.end(JSON.stringify({ wasLogoutSuccessfull: true }));
    });
}

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
  let currentUserData = {};
  if (!snapshot.empty) {
    snapshot.forEach((element) => {
      responseOb = element.id;
      currentUserData = element.data();
      db.collection("users").doc(element.id).update({
        isLoggedIn: true,
      });
    });
    responseObjValue = true;
  }

  delete currentUserData["password"];
  const responseObj = JSON.stringify({
    isAuthenticated: responseObjValue,
    userIdentifier: responseOb,
    userData: currentUserData,
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
    funds: 2500,
    userName: reqObj.userName,
    password: reqObj.password,
  });

  res.writeHead(201, RESPONSE_HEADERS.CORS_ENABLED);
  res.end(JSON.stringify({ isUserSignUpSuccessfull: true }));
}

async function userList(client, db) {
  // res.writeHead(200, RESPONSE_HEADERS.CORS_ENABLED);
  const userRef = await db.collection("users");
  const portfolioRef = await db.collection("positions");
  userRef.onSnapshot(
    (querySnapshot) => {
      let responseObj = [];
      if (querySnapshot.empty) {
        responseObj = [];
      } else {
        querySnapshot.forEach(async (element) => {
          let userObj = { ...element.data(), id: element.id, portfolio: [] };
          responseObj.push(userObj);
        });
      }
      let portfolioList = {};
      portfolioRef.onSnapshot(async (portfolioSnapShot) => {
        portfolioSnapShot.forEach((portfolio) => {
          const portfolioData = portfolio.data();
          if (portfolioList[portfolioData.userIdentifier] !== undefined) {
            portfolioList[portfolioData.userIdentifier].push(portfolioData);
          } else {
            portfolioList[portfolioData.userIdentifier] = [portfolioData];
          }
        });
        responseObj.map((user) => {
          user.portfolio = portfolioList[user.id];
        });
        client.send(JSON.stringify({ response: responseObj }));
      });
    },
    (err) => {
      console.log(`Encountered error: ${err}`);
    }
  );
}

module.exports = { login, signup, userList, logout };
