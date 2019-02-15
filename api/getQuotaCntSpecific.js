module.exports = async function (req, db){

        const params = req.body;
        const projectID = params.projectID;
        const questions = params.questions;
        if (projectID === undefined) return {errMsg: 'invalid parameters'};
        if (questions === undefined) return {errMsg: 'invalid parameters'};

        let output ={};
        try{
            if(db) {
                let mongo = await db.get();
                let find = {projectID: projectID};
                questions.forEach(que => {
                    find[que['key']] = que['value'];
                });
                output['cnt'] = await mongo.collection('SV_ANSWER').find(find).count();
            }
        }
        catch(e){
            output["errMsg"] = e.message
        }
        return output

}