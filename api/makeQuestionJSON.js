const makeQuestionJSON = async function (req, db, db2){
        const params = req.body;
        const projectID = params.projectID;
        const fs = require('fs');
        const path = require('path');
        const sql = require('mssql');

        if (projectID === undefined) return {errMsg: 'invalid parameters'};
        let output = {};

        try{
            if(db2) {
                let pool = await db2.get();
                try{
                    let jsonDir = path.join(__dirname,'../survey',projectID);
                    if(!fs.existsSync(jsonDir))fs.mkdirSync(jsonDir);
                    let queryString = 'SELECT * FROM [survey].[dbo].[tblQuestion] WHERE surveyID=@surveyID';
                    let surveyID = projectID.replace(/[^\d.-]/g, '').substr(0,5);
                    let ques = await pool.request().input('surveyID', sql.Int, surveyID).query(queryString);
                    queryString = 'SELECT * FROM [survey].[dbo].[tblExample] WHERE surveyID=@surveyID';
                    let examples = await pool.request().input('surveyID', sql.Int, surveyID).query(queryString);
                    let quesObj = {}, exObj = {}, quesArray= [], quesPaging = {};
                    if(examples.recordset.length){
                        examples.recordset.forEach(q => {
                            let qtnName = q.QtnName
                            if(exObj[qtnName] === undefined)exObj[qtnName] = []
                            exObj[qtnName].push(q)
                        });
                    };

                    if(ques.recordset.length){
                        ques.recordset.forEach(d => {
                            let qtnName = d.QtnName;
                            quesObj[qtnName] = d;
                            quesObj[qtnName].Examples = [];
                            if(quesPaging[d.PageNum] === undefined) quesPaging[d.PageNum] = [];
                            quesPaging[d.PageNum].push(d);
                            if (exObj[qtnName]) quesObj[qtnName].Examples = exObj[qtnName];
                        });

                        quesArray = Object.values(quesObj).sort((a, b) => {
                            if (a.PageNum === b.PageNum) {
                                return a.PQID < b.PQID ? -1 : a.PQID > b.PQID ? 1: 0;
                            } else {
                                return a.PageNum < b.PageNum ? -1 : a.PageNum > b.PageNum ? 1: 0;
                            }
                        });
                    }
                    let data = {};
                    data.questionsObject = quesObj;


                    //MAKE JSON FILE
                    fs.writeFileSync(path.join(jsonDir,'questions.json'), JSON.stringify(data));

                    //QUESTION TO FIELDS
                    delete require.cache[require.resolve('./questionToDataField.js')];
                    let questionToDataField = require('./questionToDataField');
                    let dataHeaders = questionToDataField(quesArray);
                    fs.writeFileSync(path.join(jsonDir,'dataFields.json'), JSON.stringify(dataHeaders));

                    //CONFIG 파일
                    queryString = 'SELECT * FROM [survey].[dbo].[tblSurvey] WHERE surveyID=@surveyID';
                    let config = await pool.request().input('surveyID', sql.Int, surveyID).query(queryString);
                    if (config.recordset.length) {
                        let configData = config.recordset.slice(0,1).shift();
                        fs.writeFileSync(path.join(jsonDir,'config.json'), JSON.stringify(configData));
                    }
                    output.result = 'OK'
                }catch(e){
                    output.errMsg = e.message
                }
            }
        }
        catch(e){
            output["errMsg"] = e.message
        }
        return output;
};
module.exports = makeQuestionJSON;