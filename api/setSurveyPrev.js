module.exports = async function (req, db){

        const params = req.body;
        const projectID = params.projectID;
        const responseID = params.responseID;
        const objectID = params.objectID;
        const converter = require('mongodb').ObjectID;
        const currentQuestions = params.currentQuestions;
        const eraseData = params.eraseData;

        if (projectID === undefined) return {errMsg: 'invalid parameters'};
        if (objectID === undefined) return {errMsg: 'invalid parameters'};
        //if (responseID === undefined) return {errMsg: 'invalid parameters'};
        if (currentQuestions === undefined) return {errMsg: 'invalid parameters'};

        let output ={};
        try{
            if(db) {
                let update = {};
                let mongo = await db.get();
                let _id = new converter(objectID);
                let find = { _id: _id, projectID: projectID };
                let exists = await mongo.collection('SV_ANSWER').findOne(find);
                let values = {};
                let unset = {status: 1};
                if (eraseData) {
                    eraseData.forEach(que => {
                        unset[`surveyData.${que}`] = 1;
                    });
                }

                let pull = {$in: currentQuestions};
                update['$pull'] = {history: pull};
                if(Object.keys(unset).length)update['$unset'] = unset;
                if(exists !== null) {
                    exists = await mongo.collection('SV_ANSWER').findOneAndUpdate(find, update, { returnOriginal: false });
                    values = exists.value;
                } else {
                    values = exists;
                }
                output['answered'] = values;
            }
        }
        catch(e){
            output["errMsg"] = e.message
        }
        return output

}