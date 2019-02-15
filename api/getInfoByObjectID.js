module.exports = async (req, db) => {
    return (async () =>{
        const converter = require('mongodb').ObjectID;
        const params = req.body;
        const objectID = params._id;

        let output ={};
        try{
            if (objectID && db) {
                let mongo = await db.get();
                let _id = new converter(objectID);
                let find = await mongo.collection('SV_ANSWER').findOne({_id: _id});
                output = find;
            }
        } catch(e) {

        }
        return output;
    })();
}