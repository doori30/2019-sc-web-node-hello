function onSend(f){
	console.log(f);
	//return true;-> 리턴값을 받아 전송됨.
	if(f.comment.value.trim() == ""){
		alert("작성자를 입력하세요.");
		f.writer.focus();
		return false;
}
	if(f.pw.value.trim().length > 16 || f.pw.value.trim().length<8){
		alert("비밀번호는 8~16자로 입력하세요.");
		f.pw.focus();
		return false;
}
	if(f.comment.value.trim() == ""){
		alert("내용을 입력하세요.");
		f.comment.focus();
		return false;
}
return true;
}
// 입력이 없으면  alert창이 뜨고 멈추고
// 입력이 되면 true값을 받아서 전송  (js방식으로 브라우저에서)