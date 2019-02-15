module.exports = async function (req, db){

        const params = req.body;
        const projectID = params.projectID;
        const responseID = params.responseID;
        const objectID = params.objectID;
        const converter = require('mongodb').ObjectID;
        const surveyData = params.surveyData;
        const ipAddress = req.clientIp;
        const agent = req.useragent;
        if (projectID === undefined) return {errMsg: 'invalid parameters'};
        if (objectID === undefined) return {errMsg: 'invalid parameters'};
        //if (responseID === undefined) return {errMsg: 'invalid parameters'};

        let output ={};
        try{
            if(db) {
                let mongo = await db.get();
                let _id = new converter(objectID);
                let find = { _id: _id, projectID: projectID };
                let lastSet = {};
                lastSet.dt = new Date().valueOf();
                lastSet.ip = ipAddress;
                //lastSet.userAgent = agent;

                let set = {
                    lastSet: lastSet,
                };
                let histories = {$each: []};
                let pull = [];
                if (!Array.isArray(surveyData)) return {errMsg: "data save Error"};
                surveyData.forEach(item =>{
                    let questionName = item.name;
                    Object.keys(item.data).forEach(key =>{
                        set[`surveyData.${key}`] = {value: item.data[key], dt: new Date().valueOf(), ip: ipAddress};
                    });
                    histories['$each'].push(questionName);
                    pull.push(questionName);
                });

                await mongo.collection('SV_ANSWER').findOneAndUpdate(find, { $pull: {history: {$elemMatch: {$in: pull}}} });
                let update = await mongo.collection('SV_ANSWER').findOneAndUpdate(find, {$set: set, $addToSet: {history: histories}}, { returnOriginal:false });
                output['answered'] = update.value;
                if (surveyData.find(d => d.name === '__end')) {
                    return {'errMsg': '종료되었습니다.'};
                }
            }
        }
        catch(e){
            output["errMsg"] = e.message
        }
        return output

}