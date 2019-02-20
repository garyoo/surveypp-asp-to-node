module.exports = async function (req, db){

        const params = req.body;
        const projectID = params.projectID;
        if (projectID === undefined) return {errMsg: 'invalid parameters'};

        let output ={};
        try{
            if(db) {
                let mongo = await db.get();
                let result = await mongo.collection('SV_QUOTA_DIST').find({projectID: projectID}).toArray();
                output = result;
            }
        }
        catch(e){
            output["errMsg"] = e.message
        }
        return output

}