module.exports = async function load(req, db){
    const fs = require('fs');
    const path = require('path');

    return (async function (){
        const params = req.body;
        const pid = params.projectID;
        const mode = params.mode || 'file';
        if (pid === undefined) return {errMsg: 'invalid parameters'};
        let output ={};
        try{
            if ( mode === 'file') {
                let configFile = path.join(__dirname,'../survey', pid, 'config.json');
                if(fs.existsSync(configFile)) {
                    return JSON.parse(fs.readFileSync(configFile, 'utf-8').toString());
                }
            } else if (mode === 'db') { //TODO : 추후에 DB 연동
                if(db) {
                    //let mongo = await db.get();
                    //output = await mongo.collection('SV_ANSWER').findOne({ proejctID: proejctID });
                }
            }
        }
        catch(e){
            output["errMsg"] = e.message
        }
        return output
    })();
}