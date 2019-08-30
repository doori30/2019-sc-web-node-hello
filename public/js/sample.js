//전역 변수
const auth = firebase.auth();
const googleAuth = new firebase.auth.GoogleAuthProvider();
var user = null;
const db = firebase.database();
//현존하는 database  두가지
//ex)엑셀 /엑셀처럼 저장이 됨.(엑셀로 추출가능.호환이 가능하다.)
//SQL(80%)
//noSQL(20%)-not only SQL (firebase사용가능.)

//인증관련 전역변수
const _btLogin = document.querySelector("#btLogin");
const _btLogout = document.querySelector("#btLogout");
const _email = document.querySelector("#email");

//데이터 베이스 관련 전역변수
const _btSave = document.querySelector("#btSave");
const _content = document.querySelector("#content");
const _lists = document.querySelector(".lists");

//인증관련 이벤트
_btLogin.addEventListener("click", function () {
	//firebase에 auth가 가지고 있는것.
	auth.signInWithPopup(googleAuth);
});
_btLogout.addEventListener("click", function () {
	auth.signOut();
});

//auth 인증의 변화가 생기면 이벤트 발생.
auth.onAuthStateChanged(function (data) {
	console.log(data);
	user = data;
	if (data) {
		_email.innerHTML = data.email + "/" + data.uid;
		_lists.innerHTML = "";
		dbInit();
	}
	//                                    구글에서 제공한 실제 id
	else _email.innerHTML = "";
	//                 null=false
});

//데이터베이스 관련 이벤트.
//↑로그인이 끝나면 데이터베이스가 실행.
function dbInit() {
	db.ref("root/notes/" + user.uid).on("child_added", onAdd);
	db.ref("root/notes/" + user.uid).on("child_removed", onRev);
	db.ref("root/notes/" + user.uid).on("child_changed", onChg);
	//             database에 사용하는 이벤트 on
}
//데이터가 추가이벤트 후 실행되는 콜백함수
function onAdd(data) {
	console.log(data.val().content + "/" + data.val().time);
	var html = `
	<ul class="list my-3 row border-bottom border-dark">
	<li class="col-8 p-2">${data.val().content}</li>
	<li class="col-4 p-2">${dspDate(new Date(data.val().time))}</li>
	</ul>`;
	_lists.innerHTML = html + _lists.innerHTML;
//function dspDate(d, type = 0)->	type 0: '2019년 8월 11일 11시 11분 11초'
}
//데이터가 삭제이벤트 후 실행되는 콜백함수
function onRev(data) {

}
//데이터가 전환이벤트 후 실행되는 콜백함수
function onChg(data) {

}

//실제데이터 저장
_btSave.addEventListener("click", function (e) {
	var content = _content.value.trim();
	if (content == "") {
		alert("글을 작성하세요.");
		_content.focus();
		return false;
	}
	db.ref("root/notes/" + user.uid).push({
		// "이동경로 문자열" + 추가 변수
		content: content,
		//          if(data)
		time: new Date().getTime()
	}).key;
	// 실행이 되면서 db.ref("root/notes/"+user.uid).on("child_added",onAdd);를 실행.
});