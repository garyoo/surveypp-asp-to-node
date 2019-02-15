module.exports = async function load(req, db){
    const jwt = require('jsonwebtoken');
    const fs = require('fs');
    const path = require('path');
    return (async function (){
        const params = req.body;
        const pid = params.projectID;
        const authKey = params.authKey;
        const mode = params.mode || 'file';
        const redirectUrl = params.redirectUrl;
        let pass = false;
        if (pid === undefined) return {errMsg: 'invalid parameters'};
        let output ={};
        if ( mode === 'file') {
            let configFile = path.join(__dirname,'../survey', pid, 'config.json');
            if(fs.existsSync(configFile) === true) {
                try{
                    let config = JSON.parse(fs.readFileSync(configFile, 'utf-8').toString());
                    if (pid === config['RandomID'] && authKey === config['AuthID'])pass = true;
                } catch(e) {
                    pass = false;
                    output["errMsg"] = e.message;
                }
            }
        } else if (mode === 'db') { //TODO : 추후에 DB 연동
            if(db) {
                //let mongo = await db.get();
                //output = await mongo.collection('SV_ANSWER').findOne({ proejctID: proejctID });
            }
        }

        if (!pass) return {"errMsg": "정확한 인증키를 입력해주세요"};
        if (pass) {
            req.session.cookie.expires = new Date(Date.now() + global.expireTime);
            req.session.cookie.maxAge = global.expireTime;
            req.session.userID = 'test';
            return {"pass": true, "redirectUrl": redirectUrl};
        }
        return output;
    })();
}