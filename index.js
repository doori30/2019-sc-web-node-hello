//app실행
const express = require("express")
const app = express();
const port = 8080;
app.listen(port, () => {
	console.log("http://127.0.0.1:" + port);
});

//node_modules참조
const bodyParser = require("body-parser") //get 방식.
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const store = require("session-file-store")(session);//세션모듈전체를 인자로 잡아서 모듈을 던저서 스토어를 만듦

//modules참조
const util = require("./modules/util"); // 내가만든 것 불러오기
const db = require("./modules/mysql_conn"); // 내가만든 것 불러오기
const pager = require("./modules/pager"); //요청들어오면 처리해줌.
const mt = require("./modules/multer_conn");
const crypto = require("crypto"); //보안(암호)

//전역변수 선언
const sqlPool = db.sqlPool;
const sqlExec = db.sqlExec;
const sqlErr = db.sqlErr;
const mysql = db.mysql;``
const salt = "My Password Key"//비밀번호 보안을 위해 양념을 침.
var loginUser = {id:"null"};

//app초기화
app.use("/", express.static("./public"));
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(session({//세션초기화 
	secret : salt, //암호화
	resave : false,
	saveUninitialized : true, //save할 때 초기화를 하지않음.
	store : new store()
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
		js,
		loginUser //null, undefined, 0, false
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
//loginUser = req.session.user;//유저정보를 세션의 유저 객체로 담음.
	//로그인시 저장된 유저 아이디 , 로그인을 하지 않을 경우 undefiend가 저장됨. login(o): userid, login(x):undefiend
	//req,session.user = {id: userid, name: username, grade: grade}
	var type = req.params.type;
	var id = req.params.id;
	if (type === undefined) type = "li"
	//if (type === "li" && id === undefined) id = "1"
	if (type === "li" && !util.nullChk(id)) id = "1"
	//if (id === undefined && type !== "in") res.redirect("/404.html");
	if (!util.nullChk(id)  && type !== "in") res.redirect("/404.html");
	// res.send(type + "/" + id);
	var pug;
	var sql;
	var result;
	var sqlVal;
	var vals = {
		css: "gbook",
		js: "gbook",
		loginUser:req.session.user
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
				var grpCnt = 5;
				//var grpCnt = Number(req.query.grpCnt);
				//if (grpCnt === undefined || typeof grpCnt !== "number") grpCnt = 5;
				//if (!util.nullChk(grpCnt)) grpCnt = 5;
				sql = "SELECT count(id) FROM gbook";
				result = await sqlExec(sql);
				totCnt = result[0][0]["count(id)"];
				const pagerVal = pager.pagerMaker({
					totCnt,
					page,
					grpCnt
				}); //pager.js에서 obj객체로 만들어서  여기서 요청을 하면 예외처리에서 먼저 확인을 거쳐서 작업을 진행. 
				sql = "SELECT * FROM gbook ORDER BY id DESC limit ?,?";
				sqlVal = [pagerVal.stRec, pagerVal.grpCnt];
				result = await sqlExec(sql, sqlVal);
				vals.datas = result[0]; //데이터 갯수 만큼의 데이터
				//데이타스는 배열.
				//datas=[
				//	번호:이름:시간:내용:비고:] 그중에 아이콘을 추가 true면 아이콘 등록 typq에 따라 각 맞는 아이콘이 보임.
				//     객체가 담기고 필요한 아이콘을 추가         
				for (let item of vals.datas) item.useIcon = util.iconChk(item.wtime, item.savefile);
				//                   객체안에 내용이 있다면 u=true/ new,jpg...
				console.log(vals.datas);
				vals.title = "방명록";
				vals.pager = pagerVal;
				pagerVal.link="/gbook/li/";
				for (let item of vals.datas) item.wtime = util.dspDate(new Date(item.wtime));
				pug = "gbook";
				res.render(pug, vals);
			})(); //즉시실행
			// var sql =
			// 	sqlExec(sql).then((data) => {	
			// 		for (let item of data[0]) item.wtime = util.dspDate(new Date(item.wtime));
			// 		res.render(pug, vals);
			// 	}).catch(sqlErr);
			// //모든필드를 셀렉트함.gbook으로 부터 내림차순으로 정렬(query문)		/ASC는 오름차순, DESC는 내림차순	//BackEnd	
			break;
		default:
			res.redirect("/404.html");
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

app.post("/api/:type", mt.upload.single("upfile"), (req, res) => {
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
	var orifile; //실제파일
	var savefile; //저장된 파일->multer에서 받음
	var oldfile;
	if (req.file) { //업로드가 안되면  undefined로 빈문서가 들어감.,화면에 글은 작성되지만 파일이 올라가지 않는다.
		orifile = req.file.originalname;
		savefile = req.file.filename;
	}
	switch(type) {
		case "remove":
			if((id != undefined && pw != undefined) || (req.session.user && id != undefined)) {
				//id, pw 가  undefined 아니거나 세션유저, id가 undefined 아니라면
				(async () => {
					// 첨부파일 가져오기
					sql = "SELECT savefile FROM gbook WHERE id="+id;
					result = await sqlExec(sql);
					savefile = result[0][0].savefile;
					// 실제 데이터베이스 삭제
					vals.push(id);
					if(req.session.user) {
						if(req.session.user.grade == 9) {
							sql = "DELETE FROM gbook WHERE id=?";
						}
						else {
							vals.push(req.session.user.id);
							sql = "DELETE FROM gbook WHERE id=? AND userid=?";
						}
					}
					else {
						vals.push(pw);
						sql = "DELETE FROM gbook WHERE id=? AND pw=?";
					}
					result = await sqlExec(sql, vals);
					if(result[0].affectedRows == 1) {
						// 파일삭제
						if(util.nullChk(savefile)) fs.unlinkSync(path.join(__dirname, "/public/uploads/"+mt.getDir(savefile)+"/"+savefile));
						// 삭제결과 리턴
						if(req.session.user) res.json({code: 200});
						else {
							obj.msg = "삭제되었습니다.";
							obj.loc = "/gbook/li/"+page;
							res.send(util.alertLocation(obj));
						}
					}
					else {
						if(req.session.user) res.json({code: 500});
						else {
							obj.msg = "비밀번호가 올바르지 않습니다.";
							obj.loc = "/gbook/li/"+page;
							res.send(util.alertLocation(obj));
						}
					}
				})();
			}
			else res.redirect("/500.html");
			break;
		case "update":
			if((id != undefined && pw != undefined) || (req.session.user && id != undefined)) {
			// if (id === undefined || pw === undefined) res.redirect("/500.html");
			// else {
				//sql = "UPDATE gbook SET writer=?, comment=? WHERE id=? AND pw=?";
				//기존파일이 있으면 앞전거 삭제하고 올려줌,없으면 새로올림
				vals.push(writer); //0 /if=x 0
				vals.push(comment); //1 /1
				if (req.file) vals.push(orifile); //2 /x
				if (req.file) vals.push(savefile); //3 /x
				vals.push(id); //4 /2
				//vals.push(pw); //5 /3
				(async () => {
					//첨부파일 가져오기
					sql = "SELECT savefile FROM gbook WHERE id=" + id; //saveFile 필드의 id=?/id=id
					result = await sqlExec(sql);
					oldfile = result[0][0].savefile;
					//실제데이터 수정
					sql = "UPDATE gbook SET writer=?, comment=? "; //0,1
					if (req.file) sql += ", orifile=?, savefile=? "; //2,3 req.file존재한다면 진행
					if(req.session.user) {
						if(req.session.user.grade == 9) sql += " WHERE id=?" //4 / 관리자
						else{//회원이면
							vals.push(req.session.user.id); // 5
							sql += " WHERE id=? AND userid=?" //4,5
						}
					}
					else {//비회원이면
						vals.push(pw); //5
						sql += " WHERE id=? AND pw=?" //4,5
					}
					//sql = "UPDATE gbook SET writer=?, comment=? ";
					//if (req.file) sql += ", orifile=?, savefile=? "; //req.file존재한다면 진행
					//sql += " WHERE id=? AND pw=?"
					//res.json({sql,vals});
					result = await sqlExec(sql, vals);
					if (result[0].affectedRows == 1) {
						//기존파일 삭제하기
						if (req.file && util.nullChk(oldfile)) fs.unlinkSync(path.join(__dirname, "/public/uploads/" + mt.getDir(oldfile) + "/" + oldfile)); //올린파일과 기존파일이 존재하면 true ->기존파일을 삭제
						obj.msg = "수정되었습니다.";
					} 
					else {
						if(req.session.user) obj.msg = "수정이 실행되지 않았습니다."
						else obj.msg = "패스워드가 올바르지 않습니다.";
					}
					obj.loc = "/gbook/li/" + page;
					res.send(util.alertLocation(obj));
					//	res.json(result);
				})();
			}
			else res.redirect("/500.html");
			break;
		default:
			res.redirect("/404.html");
			break;
	}
});

//File download Router
app.get("/download", (req, res) => {
	const fileName = req.query.fileName; //실제 저장 파일명(ex:ts-00.jpg)
	const downName = req.query.downName; //업로드 파일명(ex:desert.jpg)
	const filePath = path.join(__dirname, "/public/uploads/" + mt.getDir(fileName) + "/") + fileName;
	//const filePath = path.join(__dirname , "/public/uploads/"+mt.getDir(req.query.fileName)+"/")+req.query.fileName;
	//                                                          ->multer에 getDir을 받음.
	res.download(filePath, downName); //download()는 express가 가지고 있는 인자
	//                    "원하는 이름"쓰면 저장이름이 ""로 나옴/ 수정전에 다운로드하면 앞전에 받은 이름으로 다운이된다.
	//다르게 될 경우 크기가 바뀌거나 캐시를 지워야함.
});

//방명록을 Ajax구현
//방명록을 Ajax 통신으로 데이터만 보내주는 방식
//디자인준비.
app.get("/gbook_ajax", (req, res) => {
	loginUser = req.session.user;
	const title = "방명록-Ajax";
	const css = "gbook_ajax"
	const js = "gbook_ajax"
	const vals = {
		title,
		css,
		js,
		loginUser
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

//router 영역-POST(저장하는 곳)
app.post("/gbook_save", mt.upload.single("upfile"), (req, res) => {
	//                                                req.fileValidateError = "Y"; 
	var writer = req.body.writer;
	var comment = req.body.comment;
	//const pw = req.body.pw;
	var pw = "";
	var userid = "";
	if(req.session.user) userid = req.session.user.id;
	else pw = req.body.pw;
	// var orifile; //실제파일
	// var savefile; //저장된 파일->multer에서 받음
	//         ▼
	var orifile=""; //실제파일 빈파일이 있을 수 있기 때문에 빈값을 넣어주어야 한다.,
	var savefile=""; //저장된 파일->multer에서 받음
	if (req.file) { //업로드가 안되면  undefined로 빈문서가 들어감.,화면에 글은 작성되지만 파일이 올라가지 않는다.
		orifile = req.file.originalname;
		savefile = req.file.filename;
	}
	var result;

	const sql = "INSERT INTO gbook SET comment=?, wtime=?, writer=?,pw=?, orifile=?, savefile=?, userid=?";
	//? 안에 들어갈 내용을 const data = await connect.query(sql, vals); 에서 받아서 실행해줌.
	var vals = [comment, util.dspDate(new Date()), writer, pw, orifile, savefile, userid];
	(async () => {
		result = await sqlExec(sql, vals);
		//if(result[0].affectedRows > 0)res.redirect("gbook");
		if (result[0].affectedRows > 0) {
			if (req.fileValidateError === false) {
				//if (!req.fileValidateError) {
				//파일없이 올릴때 오류문제 해결하기 위해 원래대로 수정.
				res.send(util.alertLocation({
					msg: "허용되지 않는 파일형식 이므로 파일을 업로드 하지 않았습니다.첨부파일을 제외한 내용은 저장되었습니다.",
					//\n은 소스자체가 enter가 되어서 오류가 남.
					loc: "/gbook"
				}));
			} else res.redirect("/gbook");
		} else res.redirect("/500.html");
	})();
});
// ▲ async,await로 바꿈
//	sqlExec(sql, vals).then((data) => {
// 	console.log(data);
// 	res.redirect("/gbook");
// }).catch(sqlErr);


/* 회원가입 및 로그인 등 */
/* 회원 라우터 */
app.get(["/mem/:type","/mem/:type/:id"],memEdit);// 회원가입, 아이디/비밀번호 찾기, 리스트, 정보, 로그인, 로그아웃,삭제
app.post("/api-mem/:type", memApi); //회원가입시 각종Ajax
app.post("/mem/join", memJoin); //회원가입 저장
app.post("/mem/login", memLogin); //회원 로그인 모듈
app.post("/mem/update", memUpdate); //회원정보 수정


/* 함수구현 - GET */
//const memEdit = (req,res) => {//실행과 동시에 위에app.get을 실행하는데 함수표현식이여서 찾을수 없음.->함수 선언문으로 바꿔서 쓸 것.
function memEdit(req,res){
	//loginUser = req.session.user; //대입
	const type = req.params.type;
	//const vals = {css:"mem", js:"mem", loginUser}; //pug전달.
	const vals = {css:"mem", js:"mem", loginUser:req.session.user}; //pug전달.

	switch(type) {
		case "join":
			vals.title = "회원가입";
			vals.tel = util.telNum;
			res.render("mem_in",vals);
			break;
		case "login":
			vals.title = "회원로그인";
			res.render("mem_login",vals);
			break;
		case "logout":
			req.session.destroy();
			res.redirect("/");
			break;
		case "edit":
			(async ()=>{
				sql = "SELECT * FROM member WHERE userid='"+req.session.user.id+"'";
				result = await sqlExec(sql);
				//res.json(result[0][0]);
				vals.title = "회원정보 수정";
				vals.myData = result[0][0];
				vals.tel = util.telNum;
				//res.json(vals);
				res.render("mem_up", vals);//pug 에 vals변수를 전달함.(vals는 회원의 정보)
			})();
			break;
		case "remove":
			if(util.adminChk(req.session.user)){
			var id = req.query.id;
			//query ? / params /: body post정보
			(async () => {
				sql = "DELETE FROM member WHERE id="+id;
				result = await sqlExec(sql);
				if(result[0].affectedRows == 1) res.send(util.alertLocation({
					msg:"삭제되었습니다.",
					loc:"/mem/list"
				}))
				else res.send(util.alertLocation({
					msg: "삭제가 실패하였습니다.",
					loc: "/mem/list"
				}))
			})();
		}
		else res.send("/500.html");
			break;
		case "list":
			var totCnt = 0;
			var page = req.params.id;
			var divCnt = 3;
			var grpCnt = 3;
			if(!util.nullChk(page)) page=1; //페이지가 false라면 page=1
			vals.title = "회원 리스트 - 관리자";
			(async () => {
				sql = "SELECT count(id) FROM member";// member로 부터 count(id)를 찾아서 
				result = await sqlExec(sql);
				totCnt = result[0][0]["count(id)"];
				const pagerVal = pager.pagerMaker({totCnt,page,grpCnt}); 
				pagerVal.link="/mem/list/";
				sql ="SELECT * FROM member ORDER BY id DESC limit ?, ?"; //id내림차순 정렬
				result = await sqlExec(sql, [pagerVal.stRec, pagerVal.grpCnt]);
				vals.lists = result[0];
				vals.pager = pagerVal;
				if(util.adminChk(req.session.user)) res.render("mem_list", vals);//pug전달
				else res.send(util.alertAdmin());
			})();
			break;

		default:
				break;
	}
}

/* 함수 구현 - POST */
function memApi(req,res) {
	const type = req.params.type;
	var sql = "";
	var sqlVals = [];
	var result ;
	switch(type) {
		case "userid":
			const userid = req.body.userid;
			(async ()=>{
				sql = "SELECT count(id) FROM member WHERE userid=?";
				sqlVals.push(userid);
				result = await sqlExec(sql, sqlVals);
				//res.json(result[0][0]["count(id)"]);
				if(result[0][0]["count(id)"] > 0) res.json({chk: false}); // 유저 아이디가 존재한다면
				else res.json({chk:true});
			})();
			break;
	}
}

//회원가입 저장
function memJoin(req, res) {
	const vals = [];
	//const salt = "My Password Key"//비밀번호 보안을 위해 양념을 침.(위에 전역변수로 선언함.)
	var userpw = crypto.createHash("sha512").update(req.body.userpw + salt).digest("base64");
	//암호화 기법중 512기법을 씀. 그리고 양념을 친 비밀번호를 업데이트 함. 마지막에 데이터 베이스에 저장함.
	vals.push(req.body.userid);
	// var userid = req.body.userid;
	// vals.push(userid);
	vals.push(userpw);
	vals.push(req.body.username);
	vals.push(req.body.tel1 + "-" + req.body.tel2 + "-" + req.body.tel3);
	vals.push(req.body.post);
	vals.push(req.body.addr1 +" "+ req.body.addr2);
	vals.push(req.body.addr3);
	vals.push(new Date());
	vals.push(2);
	var sql = "";
	var result = {};
	(async () => {
		sql = "INSERT INTO member SET userid=?, userpw=?, username=?, tel=?, post=?, addr1=?, addr2=?, wtime=?, grade=?";
		result = await sqlExec(sql, vals);
		res.send(util.alertLocation({
			msg: "회원으로 가입되었습니다.",
			loc: "/mem/login"
		}));
	})();
}

//회원정보 수정
function memUpdate(req, res) {
	const vals = [];
	var userpw = crypto.createHash("sha512").update(req.body.userpw + salt).digest("base64");
	vals.push(userpw);
	vals.push(req.body.username);
	vals.push(req.body.tel1 + "-" + req.body.tel2 + "-" + req.body.tel3);
	vals.push(req.body.post);
	vals.push(req.body.addr1 + " " + req.body.addr2);
	vals.push(req.body.addr3);
	vals.push(req.session.user.id);
	var sql = "";
	var result = {};
	(async () => {
		sql = "UPDATE member SET userpw=?, username=?, tel=?, post=?, addr1=?, addr2=? WHERE userid=?";
		result = await sqlExec(sql, vals);
	//	res.json(result[0]);
		if(result[0].affectedRows == 1) res.send(util.alertLocation({
			msg: "정보가 수정되었습니다.",
			loc: "/"
		}));
	})();
}

/* 로그인 처리 모듈 */
function memLogin(req,res){
	var userid =	req.body.loginid;
	var userpw =	req.body.loginpw;
	var result;
	var sql = "";
	var vals = [];
	userpw = crypto.createHash("sha512").update(userpw + salt).digest("base64"); //고정이된단다....옴[...]
	(async () => {
		sql = "SELECT * FROM member WHERE userid=? AND userpw=?" 
		/* 	sql = "SELECT count(id) FROM member WHERE userid=? AND userpw=?" 
			//* 모든정보를 가져올 것.
			//아이디와 패스워드가 일치하는 카운트 아이디를 찾을 것.* 모든정보를 가져올 것.
			vals.push(userid);
			vals.push(userpw);
			result = await sqlExec(sql, vals); //->데이터 베이스를 던짐.
			console.log(result);
			if(result[0][0]["count(id)"] == 1) {//일치여부 확인 ->맞으면 sql이 돌아감.
			//sql = "SELECT username, grade FROM member WHERE userid=? AND userpw=?; //찾은 아이디에 이름과 그리드정보 를 가겨옴.
			//result = await sqlExec(sql, vals); ▲ 둘 다 사용가능 ▼
				sql = "SELECT username, grade FROM member WHERE userid='"+userid+"'"; //찾은 아이디에 이름과 그리드정보 를 가져옴.
				result = await sqlExec(sql);
				//req.session.userid = userid; */
		vals.push(userid);
		vals.push(userpw);
		result = await sqlExec(sql, vals); //->데이터 베이스를 던짐.
		console.log(result);
		if(result[0].length == 1) {//일치여부 확인 ->맞으면 sql이 돌아감.
			req.session.user = {};
			req.session.user.id = userid;
			req.session.user.name = result[0][0].username;
			req.session.user.grade = result[0][0].grade;
			res.redirect("/");
		}
		else{
			req.session.destroy();
			res.send(util.alertLocation({
				msg: "아이디와 패스워드가 틀렸습니다.",
				loc: "/mem/login"
			}));
		}
	})();
}