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
	 if(!page) page= "미선택";//위에 페이지가 존재하지 않는다면 undefind로 나타나는 페이지가 없다면..
//	res.send(`<h1>${page}페이지 입니다.</h1>`); render
	var title = "도서목록";
	var css = "page";
	var js = "page";
	var vals={page, title, css, js};
	res.render("page",vals);//page라는 폴더에 vals라는 변수를 page,title을 담아서 보냄.
});

//router 영역-POST