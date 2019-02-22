module.exports = async ({req, res, next, db, sql}) => {

    const returnStatus = (s) => {
        let status = 'Drop';
        switch (s) {
            case 998:
                status = 'QuotaFull';
                break;
            case 999:
                status = 'Completed';
                break;
            case 996:
                status = 'Screened';
                break;
            case undefined:
            case 0:
                status = 'Drop';
                break;
        }

        return status;
    }

    return (async () =>{
        const params = req.query;
        const projectID = params.pid;
        const execType = params.execType||'fwv';
        if (projectID === undefined) return {errMsg: 'invalid parameters'};
        let output ={execType: execType};

        if (execType === 'fwv') {   //기본
            try{
                if(db) {
                    let mongo = await db.get();
                    let aggregates = [];
                    aggregates.push({$match: {projectID: projectID}});
                    aggregates.push({
                        $group:{
                            _id:{
                                groupID: '$groupID',
                                status: '$status'
                            },
                            count: {$sum: 1}
                        }
                    });
                    aggregates.push({
                        $sort: {'_id.groupID':1, '_id.status': 1}
                    });
                    let result = await mongo.collection('SV_ANSWER').aggregate(aggregates).toArray();
                    //응답자 현황
                    output['status'] = {'Total': {group: 'Total', data: {Total: 0, Completed: 0, Screened: 0, QuotaFull: 0, BadAnswer: 0, Drop: 0}}};
                    for(let r of result) {
                        let type = r._id.groupID || 'undefined';
                        let status = returnStatus(r._id.status);
                        if (output['status'][type] === undefined) output['status'][type] = {group: type, data: {Total: 0, Completed: 0, Screened: 0, QuotaFull: 0, BadAnswer: 0, Drop: 0}};
                        output['status'][type]['data'][status] = r.count;
                        output['status'][type]['data']['Total'] += r.count;
                    }

                    for(let d of Object.values(output['status'])) {
                        for(let key in d.data) {
                            output['status']['Total'].data[key] += d.data[key];
                        }
                    }

                    //일자별 참여자 수
                    aggregates = [];
                    aggregates.push({$match: {projectID: projectID}});
                    aggregates.push({$project: {status: {$ifNull: ['$status', 0]}, date: {$ifNull: ['$lastSet.dt','$start.dt']}}});
                    aggregates.push({$project: {status: '$status', date: {'$add': [new Date(0), '$date']}}});
                    aggregates.push({$group:{
                            _id: {
                                date: {$dateToString: {format: '%Y-%m-%d', date: '$date'}},
                                status: '$status'
                            }, count: {$sum: 1}
                        }});
                    aggregates.push({$sort: {'_id.date': 1}});
                    let dateResult = await mongo.collection('SV_ANSWER').aggregate(aggregates).toArray();
                    let allDates = dateResult.map(d => d._id.date);

                    output['dateStatus'] = {Total: {}, Completed: {}, Screened: {}, QuotaFull: {}, BadAnswer: {}, Drop: {}};
                    for(let d of allDates) {
                        output['dateStatus']['Total'][d] = 0;
                        output['dateStatus']['Completed'][d] = 0;
                        output['dateStatus']['Screened'][d] = 0;
                        output['dateStatus']['QuotaFull'][d] = 0;
                        output['dateStatus']['BadAnswer'][d] = 0;
                        output['dateStatus']['Drop'][d] = 0;
                    }

                    for(let d of dateResult) {
                        let status = returnStatus(d._id.status);
                        let date = d._id.date;
                        if(output['dateStatus']['Total'][date] === undefined)output['dateStatus']['Total'][date] = 0;
                        output['dateStatus']['Total'][date] += d.count;
                        output['dateStatus'][status][date] = d.count;
                    }
                }
            }
            catch(e){
                output["errMsg"] = e.message
            }
        } else if(execType === 'rdtView') { //연동 설정
            output['project'] = {};
            const sqlDef = require('mssql');
            try{
                if(sql) {
                    let pool = await sql.get(true);
                    let reqFields = [
                        'grpidA','grpidA_State','grpidA_Control','grpidA_Msg','grpidA_CO','grpidA_SO','grpidA_QO','grpidA_BO'
                        ,'grpidB','grpidB_State','grpidB_Control','grpidB_Msg','grpidB_CO','grpidB_SO','grpidB_QO','grpidB_BO'
                        ,'grpidC','grpidC_State','grpidC_Control','grpidC_Msg','grpidC_CO','grpidC_SO','grpidC_QO','grpidC_BO'
                        ,'grpidD','grpidD_State','grpidD_Control','grpidD_Msg','grpidD_CO','grpidD_SO','grpidD_QO','grpidD_BO'
                        ,'grpidE','grpidE_State','grpidE_Control','grpidE_Msg','grpidE_CO','grpidE_SO','grpidE_QO','grpidE_BO'
                        ,'grpidF','grpidF_State','grpidF_Control','grpidF_Msg','grpidF_CO','grpidF_SO','grpidF_QO','grpidF_BO'
                        ,'grpidG','grpidG_State','grpidG_Control','grpidG_Msg','grpidG_CO','grpidG_SO','grpidG_QO','grpidG_BO'
                        ,'grpidH','grpidH_State','grpidH_Control','grpidH_Msg','grpidH_CO','grpidH_SO','grpidH_QO','grpidH_BO'
                        ,'grpidA_clsDate','grpidB_clsDate','grpidC_clsDate','grpidD_clsDate','grpidE_clsDate','grpidF_clsDate','grpidG_clsDate','grpidH_clsDate'
                    ];
                    let query = `SELECT TOP 1 ${reqFields.join(',')} FROM [dbo].[tblProject] WHERE randomId=@projectID `;
                    let project = await pool.request().input('projectID', sqlDef.VarChar, projectID).query(query);
                    if (project.recordset.length) {
                        let data = project.recordset[0];
                        for(let key in data) {
                            let d = data[key];
                            let group = key.substring(0,6);
                            if(output['project'][group] === undefined && data[group] !== '')output['project'][group] = {};
                            if(output['project'][group]){
                                let newName = key.split('_');
                                if(newName.length === 2) {
                                    output['project'][group][newName.pop().toLowerCase()] = d;
                                } else {
                                    output['project'][group]['name'] = d;
                                }
                                //console.log(key, d);

                            }

                        }
                    }
                }
            } catch(e) {
                console.log(e);
            }
        }

        return output;
    })();




}