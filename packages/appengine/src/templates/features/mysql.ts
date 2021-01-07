
// import { createConnection } from 'mysql'

// import createDebug from 'debug'
// const debug = createDebug('@appengine:mysql')

// export function applySql(options: { host: string, port: number, user: string, password: string, sql: string[], insecureAuth: boolean }) {

//     debug('applySql', options)

//     const connection = createConnection(options)
//     connection.connect()

//     for (const sqlStatement of options.sql) {
//         connection.query(sqlStatement, function (error, results) {
//             if (error) throw error
//             debug('MySql statement executed:', results)
//         })
//     }
//     connection.end()

// }