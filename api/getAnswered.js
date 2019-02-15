module.exports = async function load(req, db){
    return (async function (){
        const params = req.body;
        const projectID = params.projectID;
        const responseID = params.responseID;
        const groupID = params.groupID;
        if (projectID === undefined) return {errMsg: 'invalid parameters'};
        let output ={};
        try{
            if(db) {
                let mongo = await db.get();
                let result = await mongo.collection('SV_ANSWER').findOne({ projectID: projectID, responseID: responseID });
                if (result === null) {
                    let startSet = {
                        dt: new Date().valueOf(),
                        ip: req.clientIp,
                        userAgent: req.useragent
                    };
                    let inserted = await mongo.collection('SV_ANSWER').insertOne({projectID: projectID, responseID: responseID, groupID: groupID, startSet: startSet.valueOf()});
                    output['_id'] = inserted.insertedId.toString();
                } else {
                    output = result;
                }
            }
        }
        catch(e){
            output["errMsg"] = e.message
        }
        return output;
    })();
};