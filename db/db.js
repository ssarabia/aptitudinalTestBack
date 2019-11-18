const sql = require('mssql')
const config = {
    user: 'ssarabia',
    password: 'kzySZQ42*',
    server: 'localhost',
    database: 'InfoSellers',
}

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to MSSQL')
        return pool
    })
    .catch(err => console.log('Database Connection Failed! Bad Config: ', err))

module.exports = {
    sql, poolPromise
}