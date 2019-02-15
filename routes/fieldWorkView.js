module.exports = async (req, res, next, db) => {
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
                output['status'] = {'Total': {group: 'Total', data: {Total: 0, Completed: 0, Screened: 0, QuotaFull: 0, BadAnswer: 0, Drop: 0}}};
                for(let r of result) {
                    let type = r._id.groupID || 'undefined';
                    let status = 'Drop';
                    switch (r._id.status) {
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
                            status = 'Drop';
                            break;
                    }

                    if (output['status'][type] === undefined) output['status'][type] = {group: type, data: {Total: 0, Completed: 0, Screened: 0, QuotaFull: 0, BadAnswer: 0, Drop: 0}};
                    output['status'][type]['data'][status] = r.count;
                    output['status'][type]['data']['Total'] += r.count;
                }

                for(let d of Object.values(output['status'])) {
                    for(let key in d.data) {
                        output['status']['Total'].data[key] += d.data[key];
                    }
                }

            }
        }
        catch(e){
            output["errMsg"] = e.message
        }
        return output;
    })();
}