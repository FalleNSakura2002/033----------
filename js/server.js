//请求express

var express = require("express");

//创建express对象

var app = express();

//请求mysql

var mysql = require("mysql");

//设置数据库连接信息

var connection = mysql.createConnection({
  host: "localhost",

  user: "root",

  password: "123456",

  port: "3306",

  database: "test",
});

//建立连接

connection.connect();

//设置静态文件路径

app.use(express.static("public"));

//在浏览器中访问localhost:3000,默认打开login.html页面

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/" + "register.html");
});

//创建实现登录功能的路由

app.get("/login", function (req, res) {
  //获取用户输入的账号，密码

  var response = {
    account: req.query.account,

    password: req.query.password,
  };

  //创建查询数据的sql语句实现登录功能，查询账号和密码并且与用户输入的账号密码完全一致

  var selectSQL =
    "select account,password from user where account = '" +
    req.query.account +
    "' and password = '" +
    req.query.password +
    "'";

  //进行数据库操作

  connection.query(selectSQL, function (err, result) {
    //打印错误信息

    if (err) {
      console.log("[login ERROR] - ", err.message);

      return;
    }

    //如果查询结果为空，则登录失败，否则登录成功

    if (result == "") {
      console.log("帐号密码错误");

      res.end("fail");
    } else {
      console.log("登录成功");

      res.end("success");
    }
  });

  console.log(response);
});

//在浏览器中访问localhost:3000/register.html,打开register.html页面

app.get("/register.html", function (req, res) {
  res.sendFile(__dirname + "/" + "register.html");
});

//创建实现注册功能的路由

app.get("/process_get", function (req, res) {
  //获取用户输入的账号，密码，姓名

  var response = {
    account: req.query.account,

    password: req.query.password,

    name: req.query.name,
  };

  //创建增加数据的sql语句实现注册功能

  var addSql = "INSERT INTO user(account,password,name) VALUES(?,?,?)";

  //获取用户输入的数据

  var addSqlParams = [req.query.account, req.query.password, req.query.name];

  connection.query(addSql, addSqlParams, function (err, result) {
    //如果插入数据失败，则注册失败，否则注册成功

    if (err) {
      console.log("[INSERT ERROR] - ", err.message);

      res.end("fail");

      //如果失败就直接return不会执行下面的代码

      return;
    }

    res.end("success");

    console.log("注册成功");
  });

  console.log(response);
});

//创建服务器

var server = app.listen(3000, function () {
  console.log("访问地址为 localhost:3000");
});
