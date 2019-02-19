module.exports = async (req, res, next, db) => {

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
        if (projectID === undefined) return {errMsg: 'invalid parameters'};
        let output ={};

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
        return output;
    })();




}