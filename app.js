const express = require('express'); //'express.js'
const app = express();
const bodyParser = require("body-parser");
const db = require("./modules/mysql_conn");
const sqlPool = db.sqlPool; //db안에 있는 conn과 mysql이 온것.
const sqlErr = db.sqlErr;
const sqlExec = db.sqlExec;
const util = require("./modules/util");

app.listen(8000, ()=>{//8000번 포트로 누군가 접속하면 함수를 실행해라.
	console.log("http://localhost:8000");
});

//Router(길잡이)
app.use(bodyParser.urlencoded({extended: true})); //바디해석을 url의 encoding 객체를 파싱할지 말지.
app.use("/",express.static("./public"));

app.get("/hello", (req,res) => {
var id = req.query.userid; //http:127.0.0.1:8000/hello(get방식요청)(인자)?userid=doori/var id=doori라는 유저아이디를 받음.
var style = `style="text-align:center; color:tomato; padding:3rem;"`;
var html = `<h1 ${style}>${id} 님 반갑습니다~~~~</h1>`;
	res.send(html);
});

app.post("/gbook_save", (req, res) => {
	const comment = req.body.comment;
	const sql = "INSERT INTO gbook SET comment=?, wtime=?"; 
	//? 안에 들어갈 내용을 const data = await connect.query(sql, vals); 에서 받아서 실행해줌.
	const vals = [comment, util.dspDate(new Date())];
	sqlExec(sql, vals).then((data) => {//promise를 리턴 불러오는 개체.구체적으로 편하게 찾기위해 사용하는 함수가 then
		console.log(data);               //콜백을 simple하게 만들어줌. mysql에 대한 결과값을 보여줌.
		res.send(data);
	}).catch(sqlErr);
});
