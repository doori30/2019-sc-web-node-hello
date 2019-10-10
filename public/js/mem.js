//아이디 중복 체크
$("#userid").on("blur",function(){
	var userid = $(this).val().trim();
	//console.log(userid.indexOf(" "));
	var idType = /^[A-Za-z0-9+]{6,16}$/;  //아이디 정규표현식 글자는 6~16자 
//	if(userid.length >= 6 && userid.length <= 16 && userid.indexOf(' ') < 0){ 
	if(idType.test(userid)){ //정규표현식이 가지고 있는 method
	ajax("/api-mem/userid", "post", {userid: userid}, function(res){
		//	console.log(res);
		$(".userid-cmt").empty();
	if(res.chk){
		$(".userid-cmt").text('* 사용가능한 아이디 입니다.');
		$(".userid-cmt").css({"color": "blue"});
		$("#userid").css({"border": "1px solid blue"});
	}
	else {
		$(".userid-cmt").text('* 사용할 수 없는 아이디 입니다.');
		$(".userid-cmt").css({"color": "red"});
		$("#userid").css({"border": "1px solid red"});
		$("#userid").focus();
	}
	});
}
else {
	$(".userid-cmt").text("* 아이디는 영문, 숫자 6 ~ 16자 입니다.(띄어쓰기X)");
	$(".userid-cmt").css({"color": "red"});
		$("#userid").css({"border": "1px solid red"});
		$("#userid").focus();
}
});