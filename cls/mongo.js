module.exports = (function (dbName){
    const fs = require('fs');
    const path = require('path');
    const mongoClient = require('mongodb').MongoClient;
    let client;
    console.warn("mongo cls init...");
    let dbUrl;

    try {
        dbUrl = fs.readFileSync(path.resolve(__dirname,'../conf','mongo.json'));
        dbUrl = JSON.parse(dbUrl.toString()).url;
        return {
            get: async function () {
                if(client){
                    if (client.isConnected()) {
                        return client.db(dbName||"survey");
                    }
                }
                client = await mongoClient.connect(dbUrl,{connectTimeoutMS: 1000, socketTimeoutMS: 2000, useNewUrlParser: true });
                return client.db(dbName||"survey");
            }
        }
    } catch(e) {
        console.log(e);
    }
})();