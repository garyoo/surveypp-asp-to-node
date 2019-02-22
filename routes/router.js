module.exports = async ({req, res, next, db, mssql}) => {
    return (async () =>{
        const params = req.query;
        const projectID = params.pid;
        const responseID = params.resid;
        const groupID = params.grpid || 'NG';
        const pass = params.passive;
        if (projectID === undefined) return {errMsg: 'invalid parameters'};
        let output ={};

        let passive = {};
        try{
            if (pass) passive = JSON.parse(pass);
        }catch(e){

        }

        try{
            if(db) {
                let mongo = await db.get();
                if (responseID === undefined || responseID === '') {
                    const uuid = require('uuid/v1');
                    let insertData = {
                        projectID: projectID,
                        groupID: groupID,
                        responseID: uuid(),
                        surveyData: {__start: {dt: new Date().valueOf(), ip: req.clientIp, userAgent: req.useragent}},
                    };
                    for(let key of Object.keys(passive)) {
                        if (!insertData.hasOwnProperty(key))insertData.surveyData[key] = {value: passive[key], dt: new Date().valueOf()};
                    }
                    let insert = await mongo.collection('SV_ANSWER').insertOne(insertData);
                    let data = insert.ops.shift();
                    return {"redirectUrl": `./?_id=${data._id}`};
                } else {
                    let existsData = await mongo.collection('SV_ANSWER').findOne({projectID: projectID, responseID: responseID, groupID: groupID});
                    if (existsData !== null) return {"redirectUrl": `./?_id=${existsData._id}`};
                    let insertData = {
                        projectID: projectID,
                        groupID: groupID,
                        responseID: responseID,
                        surveyData: {__start: {dt: new Date().valueOf(), ip: req.clientIp, userAgent: req.useragent}},
                    };
                    for(let key of Object.keys(passive)) {
                        if (!insertData.hasOwnProperty(key))insertData.surveyData[key] = {value: passive[key], dt: new Date().valueOf()};
                    }
                    let insert = await mongo.collection('SV_ANSWER').insertOne(insertData);
                    let data = insert.ops.shift();
                    return {"redirectUrl": `./?_id=${data._id}`};
                }
            }
            //http://localhost:3000/router?pid=S43741ldi26h&resid=v1&grpid=TG&passParameters={"uf01":"adsaasdasd","uf02":"vsdfdsfwefwf","uf03":"qeqwedsf"}
        }
        catch(e){
            output["errMsg"] = e.message
        }
        return output;
    })();
}