const express = require("express")
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const util = require("./modules/util");
const multer = require("multer");
const splitName = (file)=>{
	//확장자 처리
	//var fileName = arr.join("."); // ["a","b","jpg"] ->"a.b.jpg" 합치기
	var arr = file = file.split("."); //"a.b.jpg" -> ["a","b","jpg"] 나누기
	var obj ={};
	obj.time = Date.now();
	obj.ext = arr.pop(); //arr = ["a","b"] 확장자 맨 뒤에 빼내기
	//obj.name = arr.join("."); 앞만 추출
	obj.name = obj.time + "-" + Math.floor(Math.random() * 90 + 10); //0~89 +10 =99 확장자가 없는 이름
	obj.saveName = obj.name + "." + obj.ext;
	return obj;
}
//const upload = multer({dest: './uploads/sample/'});
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public/uploads/sample'));
  },
  filename: (req, file, cb) => {
		var newFile = splitName(file.originalname); //오리지널은 사용자가 업로드한 파일명.
    cb(null, newFile.saveName);
  }
})
const upload = multer({ storage: storage })

//앱 서버실행
app.listen(3000, () => {
	console.log("http://127.0.0.1:3000");
});

//초기설정
app.locals.prerry = true;
app.set("view engine", "ejs");
app.set("views", "./ejs");
app.use("/", express.static("./public"));
app.use(bodyParser.urlencoded({
	extended: true
}));

app.get(["/multer", "/multer/:type"], (req, res) => {
	var type = req.params.type;
	var vals = {};
	if (type === undefined) type = "in"
	switch (type) {
		case "in":
			vals.title = "파일 업로드 폼"
			vals.comment = "파일 업로드 폼 입니다.";
			res.render("multer_in",vals);
			break;
		default:
			res.send("/404.html");
			break;
	}
});

app.post("/multer_write", upload.single('upfile'), (req,res)=>{
	var title = req.body.title;
	// res.send("업로드 되었습니다.")
	//var file = req.body.upfile;//multer에게 위임하여 전달예정.
	if(req.file) res.send('<img src="/uploads/sample/'+req.file.filename+'">');
	else res.send("저장되었습니다.");
});