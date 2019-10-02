const multer = require("multer");
const fs = require("fs"); 
//File System(fs) -> node.js가 가지고 있는 file system이고 폴더와 파일을 컨트롤 한다.
const path = require("path");

//파일명을 문자열로 받아서 확장자 및 새로운 파일명으로 변경 후 리턴한다.
const splitName = (file)=>{
	var arr = file.split("."); //"a.b.jpg" -> ["a","b","jpg"] 나누기
	var obj ={};
	obj.time = Date.now();
	obj.ext = arr.pop(); //arr = ["a","b"] 확장자 맨 뒤에 빼내기
	//obj.name = arr.join("."); 앞만 추출
	obj.name = obj.time + "-" + Math.floor(Math.random() * 90 + 10); //0~89 +10 =99 확장자가 없는 이름
	obj.saveName = obj.name + "." + obj.ext;
	return obj;
}

//const rename = (oldName, newName) => {
	//fs.renameSync()//실제파일의 이름을 바꿔줌.->문제는 실제파일의 이름까지도 바뀌게됨.
//}
//파일명을 받아서 년월(ex:1909) 폴더명으로 리턴
//module.exports.getDir=(fileName)=>{} ☞ exports를 하단에서 일일히 하지 않아도 되는 장점이 있다.
const getDir = (fileName) => {
	//23142342341-34.jpg 전달받은 파일네임을 -를 기준으로 두개의배열로 만들어서 0번째 타임스탬프를 뉴데이터에 담는다.
	var d = new Date(Number(fileName.split("-")[0]));
	var year = String(d.getFullYear()).substr(2);
	var month = d.getMonth() + 1;
	if(month < 10) month = "0" + month;
	return year + month;
}


//업로드 가능한 확장자
const imgExt = ["jpg", "jpeg", "png", "gif"];
const fileExt = ["hwp", "xls", "xlsx", "ppt", "pptx", "doc", "docx", "txt", "zip", "pdf"];
const chkExt = (req, file, cb) => {
	//확장자 존재여부 확인(multer와 연결하여 쓸 예정..)
	var ext = splitName(file.originalname).ext.toLowerCase();
	if(imgExt.indexOf(ext) > -1 || fileExt.indexOf(ext) > -1) {
		req.fileValidateError = true; 
	cb(null, true);}
	//배열로부터 인덱스로 찾음 (파일로 받아서 실제 이름을 spliName넣음) 확장자를 찾아서 존재한다면 진행.(-1은 없다는 뜻.)
	else {
		req.fileValidateError = false; //파일 확인에러=Y ->req로 받음.
		cb(null, false);
	}
}

//저장 될 폴더를 생성
//1.생성할 폴더가 존재한다면 폴더 절대경로 문자열을 리턴
//2.생성할 폴더가 존재하지 않으면 폴더를 절대경로 리턴
const getPath = () => {
	//var dir = makePath();//dir: 1909
	var newPath = path.join(__dirname, "../public/uploads/"+makePath());
	//                  +    절대경로    상대경로
	if(!fs.existsSync(newPath)){
		//fs.exists동기/ 지금쓰는것은 비동기 존재여부 확인 true=존재o fals=존재x
	fs.mkdir(newPath, (err) => {
		// 아니면 newpath를 만들어줌/아니면 에러 발생
		if(err) new Error("폴더를 생성할 수 없습니다.");
	});
	}
	return newPath;
}

//자바스크립트 Date객체에서 현재의 년도와 월을 (예:1909)문자열로 리턴한다.
const makePath = () => {
	var d = new Date(); //2019-09-03 16:29:22 GMp(...)날짜객체
	//var year = d.getFullYear() + "";//문자열로 만들기 위해 ""붙임.
	//          넘버
	var year = String(d.getFullYear()).substr(2) ; //Number()
	var month = d.getMonth()+1 ;
	if(d.getMonth() + 1 < 10) month = "0" + month;
	//else month = "" + (d.getMonth + 1); 
	return year + month; //리턴값1909 newPath에 makePath담김 
	//return year.substr(2) + month;
	//             0,1,2번부터~
}

//멀터를 이용해 파일을 서버에 저장할 때 경로 및 파일명을 처리하는 모듈
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
		cb(null, getPath());
	//	cb(null, path.join(__dirname, '../public/uploads/'+getPath()));
	//__dirname: modules의 절대 경로(d:/JDR/17.node-hello/modules)
	//위의 절대경로에 상대경로를 붙인다.
  },
  filename: (req, file, cb) => {
		var newFile = splitName(file.originalname); //오리지널은 사용자가 업로드한 파일명.
    cb(null, newFile.saveName); //파일이 업로드 되는 순간 콜백이 진행 실행됨.
  }
});

//storage 객체를 이용하여 멀터를 초기화(생성) 한다.
const upload = multer({storage: storage, fileFilter: chkExt});
//																						필터링
module.exports = {
	splitName,
	upload,
	multer,
	chkExt,
	imgExt,
	fileExt,
	getDir
}
//모듈에 보내줌