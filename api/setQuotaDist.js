module.exports = async (req, db) => {
    const converter = require('mongodb').ObjectID;
    let output = {};
    let params = req.body;
    if (req.session === undefined) return {"errMsg": "세션이 만료되었습니다."};
    if(params.projectID === undefined) return {"errMsg": "필수 파라미터가 없습니다."};
    if(params._ids === undefined)return {"errMsg": "필수 파라미터가 없습니다."};
    if (req.session.projectID !== params.projectID) return {"errMsg": "권한이 없습니다."};


    try{
        let mongo = await db.get();
        let set = {};
        let find = {projectID: params.projectID};
        find['_id'] = {$in: params._ids.map(id => new converter((id)))};
        console.log(find);
        let quotas = await mongo.collection('SV_QUOTA').find(find).toArray();
        let objectIds = quotas.map(q => q._id);
        let questions = quotas.map(q => q.questions);

        set = {$set: {dt: new Date().valueOf(), questions: questions, updater: req.session}};
        let update = await mongo.collection('SV_QUOTA_DIST').findOneAndUpdate({projectID: params.projectID, queObjectID: objectIds},set,{upsert: true});
        output['msg'] = update.value ? '업데이트 되었습니다.' : '추가 되었습니다.';
    } catch(e) {
        output['errMsg'] = e.message;
    }
    return output;

}