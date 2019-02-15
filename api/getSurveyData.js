const fs = require('fs'), path = require('path');

const getSurveyData = async function (req, res, next, db){
    const xlsx = require('xlsx');
    let params = req.query;
    if(params.projectID === undefined) return res.send('invalid parameters');
    const status = params.status||'complete'; //응답자 추출
    const projectID = params.projectID;
    const mode = params.mode || 'file'; //DB? OR FILE
    let fileType = params.fileType||'xlsx';
    if (fileType === 'xlsx' || fileType === 'xls' || fileType === 'csv') {
    } else {
        fileType = 'xlsx';
    }

    try{
        let mongo = await db.get();
        let find = {projectID: projectID};
        let projection = {responseID: 1, groupID: 1, surveyData: 1, status: 1, start: 1, lastSet: 1};
        if (status.toString() === 'complete') find['status'] = 999;
        let data = await mongo.collection('SV_ANSWER').find(find, {projection: projection}).toArray();
        let defaultHeaders = [
            "_id",
            "resid",
            "grpid",
            "startDt",
            "endDt",
            "diff",
            "status",
            "ip",
            "agent"
        ];
        let dataHeaders= [];
        if (mode === 'file') {
            let questionFile = path.join(__dirname,'../survey', projectID, 'questions.json');
            if(fs.existsSync(questionFile)) {
                dataHeaders = JSON.parse(fs.readFileSync(questionFile, 'utf-8').toString()).dataHeaders;
            }
        }

        if (dataHeaders === undefined) return res.send('data header is not exists');
        let outputData = data.map(d => {

           let obj = {
               "_id": d._id.toString(),
               "resid": d.responseID,
               "grpid": d.groupID,
               "startDt": new Date(d.start.dt).toLocaleString(),
               "endDt": new Date(d.lastSet.dt).toLocaleString(),
               "diff": d.lastSet.dt && d.start.dt ?  (d.lastSet.dt - d.start.dt)/(1000*60) : 0,
               "status": d.status,
               "ip": d.lastSet.ip,
               "agent": d.lastSet.agent
           };

            dataHeaders.forEach(dh => {
                obj[dh] = "";
                if (d.surveyData[dh]) {
                    obj[dh] = d.surveyData[dh].value;
                }
            });
            return obj;
        });

        let wb = xlsx.utils.book_new();
        let ws = xlsx.utils.json_to_sheet(outputData,{"header": defaultHeaders.concat(dataHeaders)});
        xlsx.utils.book_append_sheet(wb, ws, projectID);
        let buf = xlsx.write(wb, {bookType:fileType, type:'buffer'});
        let fileName = `${projectID}_${new Date().valueOf()}.${fileType}`;
        let contentType;
        if (fileType === 'xlsx') {
            contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        }else if(fileType === 'xls'){
            contentType = "application/vnd.ms-excel";
        } else if(fileType === 'csv'){
            contentType = "text/csv";
        }
        res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-type', contentType);
        return res.send(buf);
    } catch(e) {
        console.log(e);
        return res.send(e.message);
    }


};
module.exports = getSurveyData;