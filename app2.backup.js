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
	 //	[]요청 http://127.0.0.1:3000/page
	 //	[]요청 http://127.0.0.1:3000/page/1->1이라는 값은 :page에 전달..?
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
//                     요구,응답.   
// 요청하면 응답을 함..대신 응답내용이 있어야함.
	// var gb_ajax =req.params.ajax;
	// if(!gb_ajax) gb_ajax = "미선택";
	const title = "방명록-Ajax";
	const css  = "gbook_ajax"
	const js = "gbook_ajax"
	const vals = {title,css,js};
	// {title:title, ▲값이 같아서 생략.
	// css: css,
	// js: js,}
	res.render("gbook_ajax",vals);//pug
});
//통신받을 준비.
app.get("/gbook_ajax/:page",(req,res)=>{
	//page요청을 받으면.
	//var sql = "SELECT count(id) FROM gbook";
	var page = Number(req.params.page); //gbook_ajax.js의 1
	var grpCnt = Number(req.query.grpCnt);//10
	//문자라서 숫자열로 바꿔줌.()
	//http://127.0.0.1:3000/gbook_ajax/1(url)?(주소부와 쿼리를 이어주는 문자)grpCnt=10{grpCnt:10}
	//한페이지에 보여질 목록 갯수(1페이지 5개씩)gbook_ajax에서 받아옴 {grpCnt:10}
	var stRec = (page - 1) * grpCnt;  
	//목록을 가져오기 위해 목록의 시작 INDEX
	var vals = []; //query에 보내질 ? 값
	var reData = []; //res.json에 보내질 데이터값(reData)
	//총 페이지 수 가져오기
	var sql = "SELECT count(id) FROM gbook";
	sqlExec(sql).then((data) => {
		reData.push({totCnt: data[0][0]["count(id)"]}); //0번의 0번 count id데이터(데이터를 분석) 개체를 푸쉬.
		sql = "SELECT *FROM gbook ORDER BY id DESC LIMIT ?, ?"
		vals = [stRec, grpCnt];
		sqlExec(sql,vals).then((data) => {
			reData.push(data[0]);
			res.json(reData); //1번데이터
		}).catch(sqlErr); //페이지수 가져오는 cb
	}).catch(sqlErr); 
});
//1page=0~4 2page=5~9 3page=10~14...

//router 영역-POST
app.post("/gbook_save", (req, res) => {
	const writer = req.body.writer;
	const pw = req.body.pw;
	const comment = req.body.comment;
	const sql = "INSERT INTO gbook SET comment=?, wtime=?, writer=?,pw=?"; 
	//? 안에 들어갈 내용을 const data = await connect.query(sql, vals); 에서 받아서 실행해줌.
	const vals = [comment, util.dspDate(new Date()),writer,pw];
	sqlExec(sql, vals).then((data) => {//promise를 리턴 불러오는 개체.구체적으로 편하게 찾기위해 사용하는 함수가 then
		console.log(data);               //콜백을 simple하게 만들어줌. mysql에 대한 결과값을 보여줌.
		res.redirect("/gbook");          //input에 글남긴후 다시 gbook으로 돌아옴.
	}).catch(sqlErr);
});