const zp = (n) =>{
	n<10 ?  n= "0" + n : n = n;
	return n;
}
const dspDate=(d, type) => {
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
			returnStr = d.getFullYear() + '-' + zp(d.getMonth() + 1) + '-' + zp(d.getDate()) + ' '+ zp(d.getHours()) + ":" + zp(d.getMinutes()) + ':' + zp(d.getSeconds());
			break;
	}
	return returnStr;
}
module.exports = {
	dspDate,
	zp
}