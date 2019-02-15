module.exports = async function (req, db){

        const params = req.body;
        const projectID = params.projectID;
        const quota = params.quota;
        const quotaValues = params.quotaValues;

        if (projectID === undefined) return {errMsg: 'invalid parameters'};
        if (quota === undefined) return {errMsg: 'invalid parameters'};
        if (quotaValues === undefined) return {errMsg: 'invalid parameters'};

        let output ={};
        try{
            if(db) {
                let mongo = await db.get();
                let find = {projectID: projectID,  questions: quota.map(obj => obj.questionName)};
                let set = {
                    quotaValues: quotaValues,
                    maxPage: Math.max.apply(null, quota.map(obj => obj.pageNum))
                }
                let result = await mongo.collection('SV_QUOTA').findOneAndUpdate(find,{$set: set},{upsert: true});
                output['result'] = result.value;
                output['msg'] = '저장되었습니다.'
            }
        }
        catch(e){
            output["errMsg"] = e.message
        }
        return output

}