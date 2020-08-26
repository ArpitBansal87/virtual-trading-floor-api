async function getStocksList(client, db) {
  const stockRef = await db.collection("stocks");
  stockRef.onSnapshot(querySnapshot => {
    let responseObj = [];
    if (querySnapshot.empty) {
      responseObj = [];
    } else {
        querySnapshot.forEach((element) => {
        responseObj.push(element.data());
      });
    }
    
    client.send(JSON.stringify({ response: responseObj }));
  }, err => {
      console.log(`Encountered error: ${err}`);
  } );
  
}

module.exports = { getStocksList };
