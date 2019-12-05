var express = require('express');
var svgCaptcha = require('svg-captcha');
var fs = require('fs');
var app = express();
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'test'
});



app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});



app.get('/', function(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    fs.readFile('./login.html', 'utf-8', function(err, data) {
        if (err) {
            throw err;
        } else {
            res.end(data)
        }
    });
});

app.get('/getdata', function(req, res) {
    connection.query('select * from datas', function(err, data) {
        if (err) {
            console.log('有错误,原因是' + err)
        } else {
            res.send(data)
        }
    })
});



var yzmnum = '';
app.get('/yzm', function(req, res) {
    var captcha = svgCaptcha.create({ fontSize: 50, width: 100, height: 40, noise: 3, color: true, background: '#cc9966' });
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(captcha.data);
    console.log(new Date().toLocaleString() + "验证码生成成功" + captcha.text);
    yzmnum = captcha.text;
});



app.get('/login', function(req, res) {
    //判断url请求是否携带完整参数
    if (!req.query.name || !req.query.password || !req.query.yzm) {
        let information = { code: 1, message: '登录缺少必要的参数,用户名或密码或验证码为空' }
        res.json(information);
    } else {
        connection.query('select * from username', function(err, data) {
            if (err) {
                console.log('有错误,原因是' + err)
            } else {
                var information = '';
                for (let i = 0; i < data.length; i++) {
                    if (req.query.name != data[i].name) {
                        information = { code: 4, message: '用户名不存在' };
                    } else {
                        if (req.query.name == data[i].name && req.query.password == data[i].password) {
                            information = { code: 2, message: '登录成功' };
                            break;
                        } else {
                            information = { code: 3, message: '密码错误' };
                            break;
                        }
                    }
                };
                console.log(information);
                res.json(information);

                // data.forEach(element => {
                //     console.log(this);
                //     if (req.query.name != element.name) {
                //         information = { code: 4, message: '用户名不存在' };
                //     } else {
                //         if (req.query.name == element.name && req.query.password == element.password) {
                //             information = { code: 2, message: '登录成功' };
                //         } else {
                //             information = { code: 3, message: '密码错误' };
                //         }
                //     }
                // });
                // console.log(information);
                // res.json(information);
            }

        });

    };

});


app.get('/register', function(req, res) {
    if (!req.query.name || !req.query.password || !req.query.nc) {
        let data = { code: 1, message: '注册缺少必要的参数,用户名或密码或昵称为空' }
        res.json(data);
    } else if (req.query.name.length < 6 || req.query.password.length < 6 || req.query.nc.length < 6) {
        let information = { code: 5, message: '用户名或密码或昵称的长度不小于6位' };
        res.json(information);
    } else {
        //若满足注册条件,连接数据库进行查询,查看数据库中是否已存在相同用户名
        connection.query('select * from username', function(err, data) {
            if (err) {
                console.log('有错误,原因是' + err)
            } else {
                //若连接数据库正常.遍历数据库中的数据,查看数据库中是否已存在相同用户名
                for (let i = 0; i < data.length; i++) {
                    if (req.query.name == data[i].name) {
                        information = { code: 4, message: '用户名已存在' };
                        break;
                    } else {
                        //若数据库中未有此用户名,即可进行插入操作
                        connection.query('insert into username(name,password,nc) values("' + req.query.name + '","' + req.query.password + '","' + req.query.nc + '")', function(err, data) {
                            if (err) {
                                // console.log('有错误,原因是' + err);
                                return;
                            }
                        })
                        information = { code: 5, message: '用户名注册成功' };
                    }
                };
                console.log(information);
                res.json(information);
            }

        });



    }
});


app.listen(3000, function() {
    console.log('服务器正在3000端口运行');
})