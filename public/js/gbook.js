function onSend(f){
	console.log(f);
	//return true;-> 리턴값을 받아 전송됨.
	if(f.comment.value.trim() == ""){
		alert("내용을 입력하세요.");
		f.comment.focus();
		return false;
	}
	return true;
}
// 입력이 없으면  alret창이 뜨고 멈추고
// 입력이 되면 true값을 받아서 전송