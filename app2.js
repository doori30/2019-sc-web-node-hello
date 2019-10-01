//app실행
const express = require("express")
const app = express();
const port = 3000;
app.listen(port, () => {
	console.log("http://127.0.0.1:" + port);
});

//node_modules참조
const bodyParser = require("body-parser") //get 방식.

//modules참조
const util = require("./modules/util"); // 내가만든 것 불러오기
const db = require("./modules/mysql_conn"); // 내가만든 것 불러오기
const pager = require("./modules/pager"); //요청들어오면 처리해줌.
const mt = require("./modules/multer_conn");

//전역변수 선언
const sqlPool = db.sqlPool;
const sqlExec = db.sqlExec;
const sqlErr = db.sqlErr;
const mysql = db.mysql;

//app초기화
app.use("/", express.static("./public"));
app.use(bodyParser.urlencoded({
	extended: true
}));
app.set("view engine", "pug");
app.set("views", "./views");
app.locals.pretty = true; //사용자의 정렬을 예쁘게 정리해줌.beautify와 비슷함.

//router 영역-GET
app.get(["/page", "/page/:page"], (req, res) => {
	var page = req.params.page; //query는 ?뒤에 받는 방식임.
	if (!page) page = "미선택"; //위에 페이지가 존재하지 않는다면 undefiend로 나타나는 페이지가 없다면..
	//	res.send(`<h1>${page}페이지 입니다.</h1>`); render
	var title = "도서목록";
	var css = "page";
	var js = "page";
	var vals = {
		page,
		title,
		css,
		js
	};
	res.render("page", vals); //page.pug파일에 vals({page, title, css, js})라는 변수를 담아서 보냄.
});

//방명록을 node.js 개발자가 전부 만드는 방식.
/* 
type: /in -방명록 작성
type: /li/1(id-page) - 방명록 리스트 보기
type: /up/1(id) - 선택된 방명록 수정
type: /rm/1(id) - 선택된 방명록 삭제
*/
app.get(["/gbook", "/gbook/:type", "/gbook/:type/:id"], (req, res) => {
	var type = req.params.type;
	var id = req.params.id;
	if (type === undefined) type = "li"
	if (type === "li" && id === undefined) id = "1"
	if (id === undefined && type !== "in") res.redirect("/404.html");
	// res.send(type + "/" + id);
	var pug;
	var sql;
	var result;
	var sqlVal;
	var vals = {
		css: "gbook",
		js: "gbook"
	}
	switch (type) {
		case "in":
			vals.title = "방명록 작성";
			pug = "gbook_in";
			res.render(pug, vals);
			break;
		case "li":
			(async () => {
				var totCnt = 0;
				var page = id;
				var divCnt = 3;
				var grpCnt = req.query.grpCnt;
				if (grpCnt === undefined || typeof grpCnt !== "number") grpCnt = 5;
				sql = "SELECT count(id) FROM gbook";
				result = await sqlExec(sql);
				totCnt = result[0][0]["count(id)"];
				//
				const pagerVal = pager.pagerMaker({
					totCnt,
					grpCnt,
					divCnt,
					page
				}); //pager.js에서 obj객체로 만들어서  여기서 요청을 하면 예외처리에서 먼저 확인을 거쳐서 작업을 진행. 
				sql = "SELECT * FROM gbook ORDER BY id DESC limit ?,?";
				sqlVal = [pagerVal.stRec, pagerVal.grpCnt];
				result = await sqlExec(sql, sqlVal);
				vals.datas = result[0];
				vals.title = "방명록";
				vals.pager = pagerVal;
				for (let item of vals.datas) item.wtime = util.dspDate(new Date(item.wtime));
				pug = "gbook";
				res.render(pug, vals);
			})(); //즉시실행

			// var sql =
			// 	sqlExec(sql).then((data) => {
			// 		
			// 		for (let item of data[0]) item.wtime = util.dspDate(new Date(item.wtime));
			// 		res.render(pug, vals);
			// 	}).catch(sqlErr);
			// //모든필드를 셀렉트함.gbook으로 부터 내림차순으로 정렬(query문)		/ASC는 오름차순, DESC는 내림차순	//BackEnd	
			break;
		default:
			send.redirect("/404.html")
			break;
	}
});

//http://127.0.0.1/api/
app.get("/api/:type", (req, res) => {
	var type = req.params.type;
	var id = req.query.id;
	var pw = req.query.pw;
	var sql;
	var vals = [];
	var result;
	switch (type) {
		//http://127.0.0.1/api/modalData?id=2
		case "modalData":
			if (id === undefined) res.redirect("/500.html");
			else {
				sql = "SELECT * FROM gbook WHERE id=?"
				vals.push(id);
				(async () => {
					result = await sqlExec(sql, vals);
					res.json(result[0][0]);
				})();
			}
			break;
			//http://127.0.0.1/api/remove?id=2&pw=11111111
			// case "remove":
			// 	if(id ===undefined) req.redirect("/500.html");
			// 	else{
			// 		sql = "DELETE FROM gbook WHERE id=? AND pw=?";
			// 		vals.push(id);
			// 		vals.push(pw);
			// 		(async () => {
			// 			result = sqlExec(sql, vals);
			// 			res.json(result);
			// 		})();
			// 	}
			// 	break;
		default:
			res.redirect("/404.html");
			break;
	}
});

app.post("/api/:type", (req, res) => {
	var type = req.params.type;
	var id = req.body.id;
	var pw = req.body.pw;
	var writer = req.body.writer;
	var comment = req.body.comment;
	var page = req.body.page;
	var sql = "";
	var vals = [];
	var result;
	var obj = {};
	switch (type) {
		case "remove":
			//http://127.0.0.1/api/remove?id=2&pw=11111111
			if (id === undefined || pw === undefined) res.redirect("/500.html");
			else {
				sql = "DELETE FROM gbook WHERE id=? AND pw=?";
				//WHERE을 꼭 붙여야 필요한 내용을 지울 수 있다. 아니면 전체를 지우게 됨.
				vals.push(id);
				vals.push(pw);
				//push를 해서 배열에 채워줌.
				(async () => {
					result = await sqlExec(sql, vals);
					html = `<meta charset="utf-8"><script>`;
					if (result[0].affectedRows == 1) obj.msg =  "삭제되었습니다.";
					//res.redirect("/gbook/li/"+page+"?chk=remove");
					else obj.msg = "패스워드가 올바르지 않습니다.";
						obj.loc = "/gbook/li/" + page ;
					res.send(util.alertLocation(obj));
					//이동하는 페이지(history)에서 이전페이지로 돌아가기
					//res는 셋 중 하나만 동작함.
					// res.json(result);-> 죽이지 않으면 또 result가 돌아서 오류남.
				})();
			}
			break;
		case "update":
			if (id === undefined || pw === undefined) res.redirect("/500.html");
			else {
				sql = "UPDATE gbook SET writer=?, comment=? WHERE id=? AND pw=?";
				vals.push(writer);
				vals.push(comment);
				vals.push(id);
				vals.push(pw);
				(async () => {
					result = await sqlExec(sql, vals);
					html = '<meta charset="utf-8"><script>';
					if (result[0].affectedRows == 1) 	obj.msg = "수정되었습니다.";
					else obj.msg = "패스워드가 올바르지 않습니다.";
						obj.loc = "/gbook/li/" + page ;
					res.send(util.alertLocation(obj));
					//	res.json(result);
				})();
			}
			break;
		default:
			res.redirect("/404.html");
			break;
	}
});



//방명록을 Ajax구현
//방명록을 Ajax 통신으로 데이터만 보내주는 방식
//디자인준비.
app.get("/gbook_ajax", (req, res) => {
	const title = "방명록-Ajax";
	const css = "gbook_ajax"
	const js = "gbook_ajax"
	const vals = {
		title,
		css,
		js
	};
	res.render("gbook_ajax", vals); //pug
});

//통신받을 준비.
app.get("/gbook_ajax/:page", (req, res) => {
	var page = Number(req.params.page); //gbook_ajax.js의 1
	var grpCnt = Number(req.query.grpCnt); //10
	//문자라서 숫자열로 바꿔줌.()
	var stRec = (page - 1) * grpCnt; // ->pager에 옮김
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

	(async () => {
		//총 페이지 수 가져오기(데이터 배열을 개체로 바꾸기)
		sql = "SELECT count(id) FROM gbook";
		result = await sqlExec(sql);
		reData.totCnt = result[0][0]["count(id)"];

		//레코드 가져오기
		sql = "SELECT *FROM gbook ORDER BY id DESC LIMIT ?, ?"
		vals = [stRec, grpCnt];
		result = await sqlExec(sql, vals);
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
app.post("/gbook_save", mt.upload.single("upfile"), (req, res) => {
	//                                                req.fileValidateError = "Y"; 
	const writer = req.body.writer;
	const pw = req.body.pw;
	const comment = req.body.comment;
	var orifile; //실제파일
	var savefile; //저장된 파일->multer에서 받음
	if (req.file) { //업로드가 안되면  undefined로 빈문서가 들어감.,화면에 글은 작성되지만 파일이 올라가지 않는다.
		orifile = req.file.originalname;
		savefile = req.file.filename;
	}
	var result;

	const sql = "INSERT INTO gbook SET comment=?, wtime=?, writer=?,pw=?, orifile=?, savefile=?";
	//? 안에 들어갈 내용을 const data = await connect.query(sql, vals); 에서 받아서 실행해줌.
	const vals = [comment, util.dspDate(new Date()), writer, pw, orifile, savefile];
	(async () => {
			result = await sqlExec(sql, vals);
			//if(result[0].affectedRows > 0)res.redirect("gbook");
			if (result[0].affectedRows > 0) {
				//	if(req.fileValidateError === false){
				if (!req.fileValidateError) {
					res.send(util.alertLocation({
						msg: "허용되지 않는 파일형식 이므로 파일을 업로드 하지 않았습니다.첨부파일을 제외한 내용은 저장되었습니다.",
						//\n은 소스자체가 enter가 되어서 오류가 남.
						loc: "/gbook"
					}));
				} 
			else res.redirect("/gbook");
		}
		else res.redirect("/500.html");
	})();
});
// ▲ async,await로 바꿈
//	sqlExec(sql, vals).then((data) => {
// 	console.log(data);
// 	res.redirect("/gbook");
// }).catch(sqlErr);