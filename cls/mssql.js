module.exports = (function (){
    const fs = require('fs');
    const path = require('path');
    const sql = require('mssql');

    let pool;
    console.warn("sql cls init...");
    try {
        let config = fs.readFileSync(path.resolve(__dirname,'../conf','mssql.json'));
        config = JSON.parse(config.toString());

        return {
            get: async function () {
                if(pool){
                    return pool;
                }
                pool = new sql.ConnectionPool(config);
                await pool.connect();
                return pool;
            }
        }
    } catch(e) {
        console.log(e);
    }
})();