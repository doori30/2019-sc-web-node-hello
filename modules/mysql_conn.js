const mysql = require("mysql"); //npm i -S mysql로 설치한 모듈 불러오기
const conn =  mysql.createPool({
	host:"127.0.0.1",
	user:"doori30",
	password: "000000",
	port: 3306,
	database: "doori30",
	connectionLimit: 10        //동시 접속자   1000명정도 처리가능(숫자가 올라가면 메모리가 그만큼 올라가야한다.) 
}); //원하는 데이터 베이스에 접속

module.exports = {
	mysql,
	conn
}