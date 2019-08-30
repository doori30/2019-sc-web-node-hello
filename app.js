// 응답할 파일.(요청하는 것에 대해서 작업할 파일)
// 이 안에서는 js는 생략 가능하다.
// 단, 자바스크립트를 제외한 것은 끝에 확장명을 써줘야함.
const express = require('express'); //'express.js'
//△ function(){}->express ->require에 넣어 변수를 만듦.
//▽ 리턴값이 있어서 express로 받을 수 있다. express실행함.
const app = express();
//▽ listen() : express 의 메서드(method) 이며, 서버를 구동시킨다.
app.listen(8000, ()=>{//8000번 포트로 누군가 접속하면 함수를 실행해라.
	console.log("http://localhost:8000")
});


//Router(길잡이)
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
