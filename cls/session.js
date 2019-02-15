module.exports = (function (){
    const fs = require('fs');
    const path = require('path');
    const session = require('express-session');
    const mongoStore = require('connect-mongo')(session);
    const SESSION_EXPIRE_TIME = global.expireTime; //30분
    console.warn("mongoSession cls init...");
    let sessionUrl;

    try {
        sessionUrl = fs.readFileSync(path.resolve(__dirname,'../conf','mongo.json'));
        sessionUrl = JSON.parse(sessionUrl.toString()).sessionUrl;
        return {store: new mongoStore({url: sessionUrl, touchAfter: SESSION_EXPIRE_TIME}),expireTime: SESSION_EXPIRE_TIME, session: session};
    } catch(e) {
        console.log(e);
    }
})();