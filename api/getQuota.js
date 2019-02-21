module.exports = async (req, db) => {
    const converter = require('mongodb').ObjectID;
    const params = req.body;
    const projectID = params.projectID;
    if (projectID === undefined) return {errMsg: 'invalid parameters'};

    let output ={};
    let mongo;

    try{
        if(db) {
            mongo = await db.get();
        }
    }
    catch(e) {
        return {"errMsg": e.message};
    }



    if (mongo) {

        let quotaFind = {projectID: projectID};

        //MARK: PUBLIC 모드
        if (params.objectID) {
            let find = {};
            try {
                find = {_id: new converter(params.objectID)};
            } catch(e) {
                return {"errMsg": e.message};
            }
            let dist = await mongo.collection('SV_QUOTA_DIST').findOne(find);
            if (dist) {
                if (dist.queObjectID) {
                    quotaFind["_id"] = {$in: dist.queObjectID};
                }
            }
        }

        let result = await mongo.collection('SV_QUOTA').find(quotaFind).toArray();
        output = result;
    }


    return output;
}