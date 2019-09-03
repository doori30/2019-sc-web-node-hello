// 응답할 파일.(요청하는 것에 대해서 작업할 파일)
// 이 안에서는 js는 생략 가능하다.
// 단, 자바스크립트를 제외한 것은 끝에 확장명을 써줘야함.
const express = require('express'); //'express.js'
//△ function(){}->express ->require에 넣어 변수를 만듦.
//▽ 리턴값이 있어서 express로 받을 수 있다. express실행함.
const app = express();
const bodyParser = require("body-parser");
//const nameMaker = require('./modules/test');
const db = require("./modules/mysql_conn");
const sqlPool = db.sqlPool; //db안에 있는 conn과 mysql이 온것.
const sqlErr = db.sqlErr;
const sqlExec = db.sqlExec;
const util = require("./modules/util");

//▽ listen() : express 의 메서드(method) 이며, 서버를 구동시킨다.
app.listen(8000, ()=>{//8000번 포트로 누군가 접속하면 함수를 실행해라.
	console.log("http://localhost:8000");
	// console.log(nameMaker.firstName);
	// console.log(nameMaker.lastName);
	// console.log(nameMaker.fullName());
});

//Router(길잡이)
app.use(bodyParser.urlencoded({extended: true})); //바디해석을 url의 encoding 객체를 파싱할지 말지.
app.use("/",express.static("./public"));
//public

app.get("/hello", (req,res) => {//주소줄로 hello접근하면 "Hello World"가 브라우저에서 보임. 
//	res.send(`<h1 style="text-align:center; color:blue;">Hello World</h1>`);
var id = req.query.userid; //?의 유저 아이디라는 요청이 들어오면
//http:127.0.0.1:8000/hello(get방식요청)(인자)?userid=doori/var id=doori라는 유저아이디를 받음.
var style = `style="text-align:center; color:tomato; padding:3rem;"`;
var html = `<h1 ${style}>${id} 님 반갑습니다~~~~</h1>`;
	res.send(html);
});
//프로그램을 돌릴 때 앞전작업이 적용되어있음.
//바뀐걸로 돌릴려면 앞전 작업의 서버구동을 멈추고 (ctrl+c) 다시 새로 구동해야함.(node app)


//const bodyParser = require("body-parser");
//app.use(bodyParser.urlencoded({extended: false})); //바디해석을 url의 encoding 객체를 파싱할지 말지.
// app.post("/gbook_save",(req,res)=>{
// 	var comment = req.body.comment;
// 	//연결이 되면 △ 실행
// 	db.conn.getConnection((err, connect)=>{
// 		if(err) {
// 			res.send("DB접속 오류가 발생했습니다.");
// 		}
// 		else{
// 			var sql = 'INSERT INTO gbook SET comment=?, wtime=?';
// 			console.log(util.dspDate(new Date()));
// 			var vals = [comment, util.dspDate(new Date())]; //comment=? , wtime=? 첫번째 값, 두번째값, 서버의값
// 			connect.query(sql, vals, (err,result) =>{
// 				connect.release();
// 				//에러가 뜨면 if, 아니라면 else
// 				if(err) {
// 					res.send("데이터 저장에 실패했습니다.");
// 			}
// 				else {
// 					console.log(result);
// 					res.send("데이터가 처리되었습니다");
// 				}
// 			});
// 		}
// 	});
// });

//async / await 패턴
// async function getData(sql, vals) {
// 	const connect = await conn.getConnection(async conn => conn); //await 동기화
// 	const data = await connect.query(sql, vals); 
// 	// 결과를 주기전에 55라인에서 홀딩
// 	connect.release();
// 	return data;
// }// 모듈화시키기 위해서 따로 뺌. 쿼를 던져서 값을 받아옴.
// function err(err) {
// 	console.log(err);
// }

app.post("/gbook_save", (req, res) => {
	const comment = req.body.comment;
	const sql = "INSERT INTO gbook SET comment=?, wtime=?";
	const vals = [comment, util.dspDate(new Date())];
	sqlExec(sql, vals).then((data) => {
		console.log(data);
		res.send(data);
	}).catch(sqlErr);
});
//시멘틱방식 (시맨틱 웹)
//app.get("/gbook/:type:page",(req,res) =>{});
// app.get("/gbook/:page",(req,res) =>{
// 	var page = req.params.page;
// 	res.send("현재 페이지는 "+page+" 입니다.")
// });