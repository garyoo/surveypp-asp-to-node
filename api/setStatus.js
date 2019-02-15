
module.exports = async function (req, db){

        const params = req.body;
        const projectID = params.projectID;
        const objectID = params.objectID;
        const responseID = params.responseID;
        const groupID = params.groupID;
        const status = params.status;
        const routes = params.routes;
        const converter = require('mongodb').ObjectID;

        if (projectID === undefined) return {errMsg: 'invalid parameters'};
        if (objectID === undefined) return {errMsg: 'invalid parameters'};
        if (responseID === undefined) return {errMsg: 'invalid parameters'};
        if (groupID === undefined) return {errMsg: 'invalid parameters'};
        if (status === undefined) return {errMsg: 'invalid parameters'};

        let output ={};
        try{
            if(db) {
                let mongo = await db.get();
                let find = {_id: new converter(objectID)};
                let pushHistory;
                if (status === 998) pushHistory = '__quotaOver';
                else if (status === 999) pushHistory = '__end';
                else if (status === 996) {
                    pushHistory = '__terminate';
                }
                let update = {};
                update['$set'] = {status: status};
                if (pushHistory) update['$addToSet'] = {history: pushHistory};
                let result = await mongo.collection('SV_ANSWER').findOneAndUpdate(find, update, { returnOriginal: false });
                output['answered'] = result.value;
            }
        }
        catch(e){
            output["errMsg"] = e.message
        }
        return output

}