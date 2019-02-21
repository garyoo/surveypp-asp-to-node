module.exports = async (req, db) => {
    const converter = require('mongodb').ObjectID;
    let output = {};
    let params = req.body;
    if (req.session === undefined) return {"errMsg": "세션이 만료되었습니다."};
    if(params.projectID === undefined) return {"errMsg": "필수 파라미터가 없습니다."};
    if(params.objectID === undefined) return {"errMsg": "필수 파라미터가 없습니다."};
    if (req.session.projectID !== params.projectID) return {"errMsg": "권한이 없습니다."};

    try{
        let mongo = await db.get();

        let deleteOne = await mongo.collection('SV_QUOTA_DIST').deleteOne({_id: new converter(params.objectID)});
        console.log(deleteOne);
        //output['msg'] = update.value ? '삭제 되었습니다.' : '추가 되었습니다.';
    } catch(e) {
        output['errMsg'] = e.message;
    }
    return output;

}