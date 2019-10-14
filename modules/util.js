//module.exports={};
module.exports.zp = (n) => {
	n < 10 ? n = "0" + n : n = n;
	return n;
}
module.exports.dspDate = (d, type) => {
	var type = typeof type !== 'undefined' ? type : 0;
	//type변수 =type의 형태를 찾는 typeof == '빈값' 같지 않으면 false =0 type값이 있으면 변수에 넣음.
	// 기본 (parameter)값을 지정해 줄 수 있다.
	var monthArr = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월", ];
	var year = d.getFullYear() + "년"; //2019
	var month = monthArr[d.getMonth()] + " "; //7 (0~11 배열)
	var day = d.getDate() + "일 "; //23 (1~31)
	var hour = d.getHours() + "시 "; //   (0~23배열)
	var min = d.getMinutes() + "분 "; //  (0~59배열)
	var sec = d.getSeconds() + "초 "; //  (0~59배열)
	var returnStr;

	/* 
	type 0: 2019-08-11 09:08:12 (국제 표준 ISO datetime표기법)
	type 1: '2019년 8월 11일 11시 11분 11초'
	type 2: '2019년 8월 11일 11시 11분'
	type 3: '2019년 8월 11일 11시'
	type 4: '2019년 8월 11일 '
	type 5: 2019년 8월 11일'
	type 6: 11시 11분 12초'
	*/

	switch (type) {
		case 1:
			returnStr = year + month + day + hour + min + sec;
			break;
		case 2:
			returnStr = year + month + day + hour + min;
			break;
		case 3:
			returnStr = year + month + day + hour;
			break;
		case 4:
			returnStr = year + month + day;
			break;
		case 5:
			returnStr = month + day;
			break;
		case 6:
			returnStr = hour + min + sec;
			break;
		default:
			//2019-09-03 14:08:09
			returnStr = d.getFullYear() + '-' + module.exports.zp(d.getMonth() + 1) + '-' + module.exports.zp(d.getDate()) + ' ' + module.exports.zp(d.getHours()) + ":" + module.exports.zp(d.getMinutes()) + ':' + module.exports.zp(d.getSeconds());
			break;
	}
	return returnStr;
}

module.exports.alertLocation = (obj) => {
	var html = '<meta charser="utf-8">';
	html += '<script>';
	html += 'alert("' + obj.msg + '");';
	html += 'location.href="' + obj.loc + '";';
	html += '</script>';
	return html;
}

module.exports.alertAdmin = () => {
	var html = '<meta charser="utf-8">';
	html += '<script>';
	html += 'alert("정상적인 접근이 아닙니다.");';
	html += 'location.href="/";';
	html += '</script>';
	return html;
}

module.exports.nullChk = (val) => {
	if (val !== undefined && val !== null && val !== "") return true;
	else return false;
}

module.exports.iconChk = (dt, file) => {//사용자가 파일을 안던지면 null이됨(es6)
//const iconChk = (dt, file=null) => {//사용자가 파일을 안던지면 null이됨(es6)
	//file = file?file:null ▲
	const obj = {};
	if (module.exports.nullChk(file)) obj[file.split(".").pop()] = true; //확장자
		var tsFile = new Date(dt).getTime();
		var tsNow = new Date().getTime()-(24 * 60 * 60 * 1000); //24시간 60분 초 1000/초(현재시간-24시)자바-밀리초스탬프
																														//24시간을 기준으로 24시간 전이면 NEW가 뜸.
		if(tsFile >= tsNow) obj.new = true; //파일이있다면 위에 내용실행.
	return obj;//파일일 없으면 빈객체로 진행
}

// const iconChk = (file) => {
// 	const obj = {};
// 	if (nullChk(file)) { //파일이 존재한다면
// 		obj[file.split(".").pop()] = true; //확장자
// 		var tsFile = Number(file.split("-")[0]); //밀리초스탬프를 문자열로
// 		var tsNow = new Date().getTime()-(24 * 60 * 60 * 1000); //24시간 60분 초 1000/초(현재시간-24시)자바-밀리초스탬프
// 		//24시간을 기준으로 24시간 전이면 NEW가 뜸.
// 		if(tsFile >= tsNow) obj.new = true;
// 	}//파일이있다면 위에 내용실행.
// 	return obj;//파일일 없으면 빈객체로 진행
// }//단점: 신규로 글을 등록시 파일이 없으면 NEW가 뜨지 않음.타임스탬프를 못가져옴.

module.exports.telNum =["010","011","016","017","018","019","02","031","032","033","041","042","051","052","053","054","055","061","062","063","064"];

module.exports.adminChk = (obj) =>{
	if(module.exports.nullChk(obj)){
		if(obj.grade == 9)	return true;
			else return false;
	}
		else {
		return false;
	}
}

// module.exports = {
// 	dspDate,
// 	alertLocation,
// 	alertAdmin,
// 	zp,
// 	nullChk,
// 	iconChk,
// 	telNum,
// 	adminChk
// }