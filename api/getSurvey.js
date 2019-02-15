module.exports = function (req, db){
    return (async function () {
        const fs = require('fs');
        const path = require('path');
        const params = req.body;
        const projectID = params.projectID;
        const responseID = params.responseID;
        const groupID = params.groupID;
        const mode = params.mode||'file';
        if (projectID === undefined) return {errMsg: 'invalid parameters'};
        if (responseID === undefined) return {errMsg: 'invalid parameters'};
        let mongo;
        let output ={answered: {}, question: {}};
        try{
            if(db) {
                mongo = await db.get();
                let find = { projectID: projectID, responseID: responseID, groupID: groupID };
                let result = await mongo.collection('SV_ANSWER').findOne(find);
                if (result === null) {
                    let startSet = {
                        dt: new Date().valueOf(),
                        ip: req.clientIp,
                        userAgent: req.useragent,
                        value: true
                    };
                    let saveData = Object.assign({}, find);
                    saveData.start = startSet;
                    saveData.surveyData = {['__start']: startSet, ['grpid']: {value:groupID}};
                    saveData.history = ['__start'];
                    let inserted = await mongo.collection('SV_ANSWER').insertOne(saveData);
                    saveData['_id'] = inserted.insertedId.toString();
                    result = saveData;
                }
                let lastModule = getLastModule(result.history);
                output = await getQuestion(mode, lastModule);
                output.answered = result;
            }
        }
        catch(e){
            console.log(e);
            output["errMsg"] = e.message;
        }
        return output;

        async function getQuotaQuestion () {
            try{
                return await mongo.collection('SV_QUOTA').find({projectID: projectID}).toArray();
            } catch(e) {
                return [];
            }
        }

        function getLastModule (history) {
            if (history === undefined) return '__start';
            if (!Array.isArray(history)) return '__start';
            if(!history.length) return '__start';
            let lastModule;
            lastModule = history.slice(-1);
            if (!lastModule.length ) return '__start';
            lastModule = lastModule.pop();
            return lastModule;
        }

        async function getQuestion (mode, currentModule) {
            let data = {"questionsObject":{}, "questionsArray": [], "questionsPaging": [], "currentPage": 1, "totalPage": 1, "pageUserScript": ""};
            try {
                if (mode === 'file') {
                    let questionFile = path.join(__dirname,'../survey', projectID, 'questions.json');
                    if(fs.existsSync(questionFile)) {
                        let questions = {
                            "questionsObject": {},
                            "questionsPaging": {},
                            "questionsArray": []
                        };
                        questions = JSON.parse(fs.readFileSync(questionFile, 'utf-8').toString());
                        let page = 1;
                        /*
                        if (currentModule === '__start') {
                            page = 1;
                        } else if(currentModule === '__quotaOver') {
                            page = 1;
                        } else if (currentModule === '__end'){
                            page = Object.keys(questions.questionsPaging).length;
                        } else {
                            page = questions.questionsObject[currentModule].PageNum + 1;
                        }
                        */
                        data.questionsObject = questions.questionsObject;
                        data.quota = await getQuotaQuestion();
                    }
                } else if (mode === 'db') {
                    data = await mongo.collection('SV_QUESTION').findOne({});
                }

                let pageUserScript = path.join(__dirname,'../survey', projectID, 'pageUserScript.js');
                if(fs.existsSync(pageUserScript)) {
                    data.pageUserScript = fs.readFileSync(pageUserScript, 'utf-8').toString();
                }
                data.userAgent = req.useragent;
            } catch (e) {
                console.log(e);
                output['errMsg'] = e.message;
            }
            return data;
        }
    })();
}