//const mysql = require("mysql"); //npm i -S mysql로 설치한 모듈 불러오기
const mysql = require("mysql2/promise"); //npm i -S mysql2로 설치한 모듈 
// 2는 자동반환이 가능하지만 매우 느리기 때문에 connection을 수동해주는 것이 더 편하다.
const sqlPool =  mysql.createPool({
	host:"127.0.0.1",
	user:"doori30",
	password: "000000",
	port: 3306,
	database: "doori30",
	waitForConnections : true,
	queueLimit : 0,   //아무것도 없어도 실행가능. 
	connectionLimit: 10        //동시 접속자   1000명정도 처리가능(숫자가 올라가면 메모리가 그만큼 올라가야한다.) 
}); //원하는 데이터 베이스에 접속

const sqlErr =  err => {
	console.log(err);
}

const sqlExec = async(sql, vals) => {
	const connect = await sqlPool.getConnection(async conn => conn); //await 동기화
	const data = await connect.query(sql, vals); 
	// 결과를 주기전에 55라인에서 홀딩
	connect.release();
	return data;
}

module.exports = {
	mysql,
	sqlPool,
	sqlErr,
	sqlExec
}
