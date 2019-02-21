module.exports = async function load(req, db){
    const fs = require('fs');
    const path = require('path');

    return (async function (){
        const params = req.body;
        const pid = params.projectID;
        const mode = params.mode || 'file';
        if (pid === undefined) return {errMsg: 'invalid parameters'};
        let output ={};
        try{
            if ( mode === 'file') {
                let questionFile = path.join(__dirname,'../survey', pid, 'questions.json');
                if(fs.existsSync(questionFile)) {
                    let questionJSON = JSON.parse(fs.readFileSync(questionFile, 'utf-8').toString())
                    let questionArray = questionJSON.Array;
                    console.log(questionArray.map(q=> {
                        return {
                            QtnType: q.QtnType,
                            QtnName: q.QtnName,
                            QuestionText: q.QuestionText,
                        };
                    }));
                    return questionArray.map(q=> {
                        return {
                            QtnType: q.QtnType,
                            QtnName: q.QtnName,
                            QuestionText: q.QuestionText,
                        };
                    });
                }
            } else if (mode === 'db') { //TODO : 추후에 DB 연동
                if(db) {
                    //let mongo = await db.get();
                    //output = await mongo.collection('SV_ANSWER').findOne({ proejctID: proejctID });
                }
            }
        }
        catch(e){
            output["errMsg"] = e.message
        }
        return output
    })();
}