module.exports = (() => {
    const fs = require('fs');
    const path = require('path');
    const sql = require('mssql');

    let pool;
    let realPool;

    console.warn("sql cls init...");
    try {
        let config = fs.readFileSync(path.resolve(__dirname,'../conf','mssql.json'));
        config = JSON.parse(config.toString());

        let realConfig = fs.readFileSync(path.resolve(__dirname,'../conf','real.json'));
        realConfig = JSON.parse(realConfig.toString());

        return {
            get: async function (real) {
                if (real) {
                    if(realPool){
                        return realPool;
                    }
                    realPool = new sql.ConnectionPool(realConfig);
                    await realPool.connect();
                    return realPool;
                } else {
                    if(pool){
                        return pool;
                    }
                    pool = new sql.ConnectionPool(config);
                    await pool.connect();
                    return pool;
                }
            }
        }
    } catch(e) {
        console.log(e);
    }
})();