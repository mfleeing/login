var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'test'
});

connection.connect();

connection.query('SELECT * from test', function(error, data) {
    if (error) {
        console.log("连接失败" + error)
    } else {
        console.log(data)
    }

});