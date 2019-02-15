module.exports = async function (req, db){

        const params = req.body;
        const projectID = params.projectID;
        const objectID = params.objectID;
        const converter = require('mongodb').ObjectID;

        if (projectID === undefined) return {errMsg: 'invalid parameters'};
        if (objectID === undefined) return {errMsg: 'invalid parameters'};

        let output ={};
        try{
            if(db) {
                let mongo = await db.get();
                let find = {projectID: projectID,  _id: new converter(objectID)};
                let result = await mongo.collection('SV_QUOTA').findOneAndDelete(find);
                output['result'] = result.value;
                output['msg'] = '삭제되었습니다.'
            }
        }
        catch(e){
            output["errMsg"] = e.message
        }
        return output

}