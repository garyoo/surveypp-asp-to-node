module.exports = async function (req, db){

        const params = req.body;
        const projectID = params.projectID;
        const questions = params.questions;

        if (projectID === undefined) return {errMsg: 'invalid parameters'};
        //if (questions === undefined) return {errMsg: 'invalid parameters'};

        let output ={};
        let quotaResult = [];

        try{
            if(db) {
                let mongo = await db.get();
                let find = {projectID: projectID, questions: questions};
                let quota = await mongo.collection('SV_QUOTA').findOne(find);
                let projection = {_id: false};
                let group = {_id: {}, cnt: {$sum: 1}};
                questions.forEach(que => {
                    projection[`${que}`] = `$surveyData.${que}.value`;
                    group._id[`${que}`] = `$${que}`;
                });

                let aggregates = [];
                aggregates.push({$match: {projectID: projectID, status: 999}});
                aggregates.push({$project: projection});
                aggregates.push({$group: group});

                let cursor = await mongo.collection('SV_ANSWER').aggregate(aggregates);
                let completes = await cursor.toArray();
                completes = completes.map(d => {
                    return {name: Object.keys(d._id).join('/'), value: Object.values(d._id).join('/'), cnt: d.cnt};
                    //return {[`${Object.keys(d).join('/')}`]: `${Object.values(d).join('/')}`};
                });
                if (quota.quotaValues) {
                    quotaResult = quota.quotaValues.map(q => {
                        let obj = Object.assign({comCnt: 0},q);
                        obj.comCnt = 0;
                        let find = completes.find(c => c.name === obj.name && c.value === obj.value);
                        if (find) {
                            obj.comCnt = find.cnt;
                        }
                        return obj;
                    });
                }
            }
            output = quotaResult;
        }
        catch(e){
            output["errMsg"] = e.message
        }
        return output

}