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
				//모든필드를 셀렉트함.gbook으로 부터 내림차순으로 정렬(query문)		/ASC는 오름차순, DESC는 내림차순		
				break;
	}
});

//router 영역-POST
app.post("/gbook_save", (req, res) => {
	const comment = req.body.comment;
	const sql = "INSERT INTO gbook SET comment=?, wtime=?"; 
	//? 안에 들어갈 내용을 const data = await connect.query(sql, vals); 에서 받아서 실행해줌.
	const vals = [comment, util.dspDate(new Date())];
	sqlExec(sql, vals).then((data) => {//promise를 리턴 불러오는 개체.구체적으로 편하게 찾기위해 사용하는 함수가 then
		console.log(data);               //콜백을 simple하게 만들어줌. mysql에 대한 결과값을 보여줌.
		res.redirect("/gbook");          //input에 글남긴후 다시 gbook으로 돌아옴.
	}).catch(sqlErr);
});