//const mysql = require("mysql"); //npm i -S mysql로 설치한 모듈 불러오기
const mysql = require("mysql2/promise"); //npm i -S mysql2로 설치한 모듈 
// 2는 자동반환이 가능하지만 매우 느리기 때문에 connection을 수동해주는 것이 더 편하다.
const sqlPool =  mysql.createPool({
	host:"db.doori29.gabia.io",
	user:"doori29",
	password: "tmdnlxl1004!!",
	port: 3306,
	database: "dbdoori29",
	// host:"127.0.0.1",
	// user:"doori",
	// password: "000000",
	// port: 3306,
	// database: "doori",
	waitForConnections : true,
	queueLimit : 0,   //아무것도 없어도 실행가능. 
	connectionLimit: 10        //동시 접속자   1000명정도 처리가능(숫자가 올라가면 메모리가 그만큼 올라가야한다.) 
}); //원하는 데이터 베이스에 접속

const sqlErr =  err => {
	console.log(err);
}

const sqlExec = async(sql, vals) => {
	const connect = await sqlPool.getConnection(async conn => conn); //이유없는 명령어를 설정해줌. 아무역활이 없음.
	//promise개체    -> 콜백을 감싸는 함수일 때, 
	//resolve를 프로미스로 받음.
	//await 동기화 promis 개체가 됨.(무조건 async 안에서만 사용가능)
	const data = await connect.query(sql, vals); //데이터도 프로미스개체임.
	// 결과를 주기전에 55라인에서 홀딩
	connect.release();
	return data;
}

/* async function sqlExec(sql,vals){
getConnection(async function(connect)); 또 콜백을 줘야하기 때문에 상단으로 변경됨.
} 
async와 await는 promise 개체이기 때문에 이 두가지 명령어가 들어가면 promise안에서 돌아간다.
그래서 결과값은 보기 위해서 .then()을 사용함.
콜백에서 받을 데이터를 사용함. 
*/

module.exports = {
	mysql,
	sqlPool,
	sqlErr,
	sqlExec
}
