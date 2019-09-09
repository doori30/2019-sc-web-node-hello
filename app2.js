//app실행
const express = require("express")
const app = express();

const port = 3000;
app.listen(port,()=>{
	console.log("http://127.0.0.1:"+port);
});

//node_modules참조
const bodyParser = require("body-parser")//get 방식.

//modules참조
const util = require("./modules/util");// 내가만든 것 불러오기
const db = require("./modules/mysql_conn");// 내가만든 것 불러오기

//전역변수 선언
const sqlPool = db.sqlPool;
const sqlExec = db.sqlExec;
const sqlErr = db.sqlErr;
const mysql = db.mysql;

//app초기화
app.use("/",express.static("./public"));
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","pug");
app.set("views","./views");
app.locals.pretty = true; //사용자의 정렬을 예쁘게 정리해줌.beautify와 비슷함.

//router 영역-GET
app.get(["/page","/page/:page"],(req,res)=>{
	 var page = req.params.page; //query는 ?뒤에 받는 방식임.
	 if(!page) page= "미선택";//위에 페이지가 존재하지 않는다면 undefiend로 나타나는 페이지가 없다면..
														//	res.send(`<h1>${page}페이지 입니다.</h1>`); render
	var title = "도서목록";
	var css = "page";
	var js = "page";
	var vals={page, title, css, js};
	res.render("page",vals);  //page.pug파일에 vals({page, title, css, js})라는 변수를 담아서 보냄.
});

//방명록을 node.js 개발자가 전부 만드는 방식.
app.get(["/gbook","/gbook/:type"],(req,res)=>{
	var type = req.params.type;
	var pug;
	var vals = {
		css:"gbook",
		js:"gbook"
	}
	switch(type){
		case "in":
			vals.title = "방명록 작성";
			pug = "gbook_in";
			res.render(pug,vals);
			break;
			default:
				var sql = "SELECT * FROM gbook ORDER BY id DESC" 
				sqlExec(sql).then((data)=>{
					vals.datas = data[0];
					vals.title="방명록";
					pug = "gbook";
					for(let item of data[0]) item.wtime = util.dspDate(new Date(item.wtime));	
					res.render(pug,vals);
				}).catch(sqlErr);
				//모든필드를 셀렉트함.gbook으로 부터 내림차순으로 정렬(query문)		/ASC는 오름차순, DESC는 내림차순	//BackEnd	
				break;
	}
});

//방명록을 Ajax 통신으로 데이터만 보내주는 방식
//디자인준비.
app.get("/gbook_ajax",(req,res)=>{
	const title = "방명록-Ajax";
	const css  = "gbook_ajax"
	const js = "gbook_ajax"
	const vals = {title,css,js};
		res.render("gbook_ajax",vals);//pug
});

//통신받을 준비.
app.get("/gbook_ajax/:page",(req,res)=>{
	var page = Number(req.params.page); //gbook_ajax.js의 1
	var grpCnt = Number(req.query.grpCnt);//10
	//문자라서 숫자열로 바꿔줌.()
	var stRec = (page - 1) * grpCnt;  
	//목록을 가져오기 위해 목록의 시작 INDEX
	var vals = []; //query에 보내질 ? 값
	var reData = []; //res.json에 보내질 데이터값(reData)
	var sql;
	var result;
	var reData = {};

/* 
	totcnt:2,
	rs:[
		{id:1, comment:"",wtime:"",writer:""},
		{id:1, comment:"",wtime:"",writer:""}
	]
*/

(async() => {
	//총 페이지 수 가져오기(데이터 배열을 개체로 바꾸기)
		sql = "SELECT count(id) FROM gbook";
		result = await sqlExec(sql);
		reData.totCnt = result[0][0]["count(id)"];

		//레코드 가져오기
		sql = "SELECT *FROM gbook ORDER BY id DESC LIMIT ?, ?"
		vals = [stRec, grpCnt];
		result = await sqlExec(sql,vals);
		reData.rs = result[0];
		res.json(reData); 
	})();
});

//  (async() => {
// 		sql = "SELECT count(id) FROM gbook";
// 		result = await sqlExec(sql);
// 		reData.push({totCnt: result[0][0]["count(id)"]});

// 		//레코드 가져오기
// 		sql = "SELECT *FROM gbook ORDER BY id DESC LIMIT ?, ?"
// 		vals = [stRec, grpCnt];
// 		result = await sqlExec(sql,vals);
// 		reData.push(result[0]);
// 		res.json(reData); //1번데이터
// 	});
// });

//router 영역-POST
app.post("/gbook_save", (req, res) => {
	const writer = req.body.writer;
	const pw = req.body.pw;
	const comment = req.body.comment;
	const sql = "INSERT INTO gbook SET comment=?, wtime=?, writer=?,pw=?"; 
	//? 안에 들어갈 내용을 const data = await connect.query(sql, vals); 에서 받아서 실행해줌.
	const vals = [comment, util.dspDate(new Date()),writer,pw];
	sqlExec(sql, vals).then((data) => {
		console.log(data);
		res.redirect("/gbook");
	}).catch(sqlErr);
});