//请求express
const express = require("express");

//创建express对象
var app = express();

//请求mysql
const mysql = require("mysql");

//请求cookie
var cookieParser = require("cookie-parser");

//请求ejs
const ejs = require("ejs");
app.set("view engine", "ejs");
app.set("views", "./");

//请求datatime
const sd = require("silly-datetime");

//设置数据库连接信息
var connection = mysql.createConnection({
  host: "localhost",  //请在此输入数据库对应host
  user: "",  //请在此输入数据库管理员账号
  password: "",  //请在此输入数据库管理员账号对应的密码
  port: "",  //请在此输入数据库端口
  database: "",  //请在此输入数据库名称
});

//建立数据库连接
connection.connect();

//启用cookie
app.use(cookieParser());

//设置静态文件路径
app.use(express.static(__dirname + "/"));

//在浏览器中访问localhost:8080,打开index.html页面
app.get("/", function (req, res) {
  res.sendfile(__dirname + "/" + "index.html");
});

//在浏览器中访问localhost:8080/login.html,打开login.html页面
app.get("/login.html", function (req, res) {
  res.sendFile(__dirname + "/" + "login.html");
});

//在浏览器中访问localhost:8080/register.html,打开register.html页面
app.get("/register.html", function (req, res) {
  res.sendFile(__dirname + "/" + "register.html");
});

//创建实现登录功能的路由
app.get("/login_get", function (req, res) {
  //获取用户输入的账号，密码
  var response = {
    mail: req.query.email,
    password: req.query.pswd,
  };

  //创建查询数据的sql语句实现登录功能，查询账号和密码并且与用户输入的账号密码完全一致
  var selectSQL =
    "select Email,Password from login_table where Email = '" +
    req.query.email +
    "' and Password = '" +
    req.query.pswd +
    "'";

  //进行数据库操作
  connection.query(selectSQL, function (err, result) {
    //在控制台回报错误信息
    if (err) {
      console.log("[login ERROR] - ", err.message);
      return;
    }

    //如果查询结果为空，则登录失败，否则登录成功
    if (result == "") {
      //在控制台回报错误信息
      console.log("帐号密码错误或不存在");
      res.redirect("/login_err.html");
    } else {
      console.log("登录成功");
      //从数据库中查询ID
      var selectUID =
        "select UID from User where Email = '" + req.query.email + "'";
      connection.query(selectUID, function (err, Uresult) {
        if (err) {
          console.log("[login ERROR] - ", err.message);
          return;
        } else {
          let UID = Uresult[0].UID;
          console.log("登录用户为" + UID);
          res.cookie("UID", UID);
          res.redirect("/user");
        }
      });
    }
  });
});

//创建实现注册功能的路由
app.get("/register_get", function (req, res) {
  //获取用户输入的账号，密码，姓名
  var response = {
    Uname: req.query.Uname,
    mail: req.query.email,
    password: req.query.pswd,
  };

  //创建增加数据的sql语句实现注册功能
  var addSql = "INSERT INTO login_table(Email,Password) VALUES(?,?)";
  var addUser = "INSERT INTO User(Email,UID,Uname) VALUES(?,?,?)";

  //获取用户输入的数据
  var UID = Math.floor(Math.random() * 999999999);
  var addSqlParams = [req.query.email, req.query.pswd];
  var addUserParams = [req.query.email, UID, req.query.Uname];

  connection.query(addSql, addSqlParams, function (err, result) {
    //如果输入值为空，则注册失败
    if (!req.query.email || !req.query.pswd || !req.query.Uname) {
      console.log("有输入值为空！");
      res.redirect("/register_err1.html");

      //如果出现错误,结束访问
      return;
    }

    //如果两次输入的密码不一致
    if (req.query.pswd2 != req.query.pswd) {
      console.log("验证密码错误！");
      res.redirect("/register_err3.html");

      //如果出现错误,结束访问
      return;
    }

    //如果插入数据失败，则注册失败，否则注册成功
    if (err) {
      console.log("[INSERT ERROR] - ", err.message);
      res.redirect("/register_err2.html");

      //如果出现错误,结束访问
      return;
    }
    connection.query(addUser, addUserParams, function (err, result) {
      //如果插入数据失败，则注册失败，否则注册成功
      if (err) {
        console.log("[INSERT ERROR] - ", err.message);
        res.end("未知错误！");

        //如果出现错误,结束访问
        return;
      }
      console.log("注册成功");
    });
    res.redirect("/register_ok.html");
  });

  console.log(response);
});

//跳转到主页面
app.get("/user", function (req, res) {
  //根据Cookie信息，读取UID用的sql语句
  var getUname = "select Uname from User where UID = '" + req.cookies.UID + "'";
  var Username;
  //从数据库中读取Uname
  connection.query(getUname, function (err, result) {
    //打印错误信息
    if (err) {
      console.log("[login ERROR] - ", err.message);
      return;
    }
    //从数据库回传信息中读取Uname
    Username = result[0].Uname;

    //读取主页相关数据
    var zhaomu_sql =
      "select * from zhaomu where UID = '" +
      req.cookies.UID +
      "'" +
      "order by datetime desc limit 15";
    connection.query(zhaomu_sql, function (err, result) {
      if (err) {
        console.log("[query]-:" + err);
      } else {
        console.log(result);
        //拿到result将其作为data渲染给模板引擎，渲染个人界面
        //如果此时用户为首次登录且没有招募记录，则使用模板userpage_null生成
        if (result[0] == null) {
          res.render(
            // ejs文件路径
            "./userpage_null.ejs",
            // 参数
            {
              Uname: Username,
              imgsrc: "",
            }
          );
        } else {
          //如果此时用户已经有招募记录，则使用模板userpage生成
          res.render("./userpage.ejs", {
            data: result,
            Uname: Username,
            imgsrc: "img/class_" + result[0].Chapoi + ".png",
          });
        }
      }
    });
    console.log(Username);
  });
});

//实现招募功能
app.get("/zhaomu", function (req, res) {
  //生成一个随机数，用于从卡池中抽取干员
  var zhaomu_res_rand = Math.floor(Math.random() * 8);
  //将招募结果插入数据库的sql语句
  var zhaomu_comm =
    "INSERT INTO zhaomu(datetime,date,UID,Chapoi,Chaname) VALUES(?,?,?,?,?)";
  var zhaomu_res;
  //用于记录时间的两个变量
  var updatetimes = sd.format(new Date(), "YYYY-MM-DD HH:mm:ss");
  var update = sd.format(new Date(), "YYYY-MM-DD");
  //根据不同的随机数，生成不同的结果并形成sql格式
  if (zhaomu_res_rand == 0) {
    zhaomu_res = [updatetimes, update, req.cookies.UID, "先锋", "桃金娘"];
  } else if (zhaomu_res_rand == 1) {
    zhaomu_res = [updatetimes, update, req.cookies.UID, "先锋", "德克萨斯"];
  } else if (zhaomu_res_rand == 2) {
    zhaomu_res = [updatetimes, update, req.cookies.UID, "先锋", "风笛"];
  } else if (zhaomu_res_rand == 3) {
    zhaomu_res = [updatetimes, update, req.cookies.UID, "近卫", "棘刺"];
  } else if (zhaomu_res_rand == 4) {
    zhaomu_res = [updatetimes, update, req.cookies.UID, "近卫", "陈"];
  } else if (zhaomu_res_rand == 5) {
    zhaomu_res = [updatetimes, update, req.cookies.UID, "近卫", "斯卡蒂"];
  } else if (zhaomu_res_rand == 6) {
    zhaomu_res = [updatetimes, update, req.cookies.UID, "医疗", "凯尔希"];
  } else if (zhaomu_res_rand == 7) {
    zhaomu_res = [updatetimes, update, req.cookies.UID, "重装", "泥岩"];
  } else if (zhaomu_res_rand == 8) {
    zhaomu_res = [updatetimes, update, req.cookies.UID, "医疗", "夜莺"];
  } else if (zhaomu_res_rand == 9) {
    zhaomu_res = [updatetimes, update, req.cookies.UID, "医疗", "闪灵"];
  } else if (zhaomu_res_rand == 10) {
    zhaomu_res = [updatetimes, update, req.cookies.UID, "术师", "艾雅法拉"];
  } else if (zhaomu_res_rand == 11) {
    zhaomu_res = [updatetimes, update, req.cookies.UID, "术师", "阿米娅"];
  } else if (zhaomu_res_rand == 12) {
    zhaomu_res = [updatetimes, update, req.cookies.UID, "术师", "异客"];
  } else if (zhaomu_res_rand == 13) {
    zhaomu_res = [updatetimes, update, req.cookies.UID, "特种", "水月"];
  } else if (zhaomu_res_rand == 14) {
    zhaomu_res = [updatetimes, update, req.cookies.UID, "特种", "红"];
  } else if (zhaomu_res_rand == 15) {
    zhaomu_res = [updatetimes, update, req.cookies.UID, "特种", "归溟幽灵鲨"];
  } else if (zhaomu_res_rand == 16) {
    zhaomu_res = [updatetimes, update, req.cookies.UID, "辅助", "浊心斯卡蒂"];
  } else if (zhaomu_res_rand == 17) {
    zhaomu_res = [updatetimes, update, req.cookies.UID, "辅助", "安洁莉娜"];
  } else if (zhaomu_res_rand == 18) {
    zhaomu_res = [updatetimes, update, req.cookies.UID, "狙击", "鸿雪"];
  } else if (zhaomu_res_rand == 19) {
    zhaomu_res = [updatetimes, update, req.cookies.UID, "狙击", "空弦"];
  } else if (zhaomu_res_rand == 20) {
    zhaomu_res = [updatetimes, update, req.cookies.UID, "狙击", "灰烬"];
  } else {
    zhaomu_res = [updatetimes, update, req.cookies.UID, "重装", "瑕光"];
  }

  //连接数据库，插入结果
  connection.query(zhaomu_comm, zhaomu_res, function (err, result) {
    //如果插入数据失败，则注册失败，否则注册成功
    if (err) {
      //回报错误信息
      console.log("[INSERT ERROR] - ", err.message);
      //将回报结果用UTF-8编码输出
      res.writeHead(200, {
        "content-type": "text/html;charset=utf8",
      });
      res.end("未知错误！");
      //如果失败就直接return不会执行下面的代码
      return;
    }
    console.log("招募成功");
    //重新生成该页面
    res.redirect("/user");
  });
});

//创建服务器
var server = app.listen(8080, function () {
  console.log("访问地址为 localhost:8080");
});
