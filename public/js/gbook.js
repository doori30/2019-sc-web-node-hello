function onSend(f){
	console.log(f);
	//return true;-> 리턴값을 받아 전송됨.
	if(f.comment.value.trim() == ""){
		alert("작성자를 입력하세요.");
		f.writer.focus();
		return false;
}
	if(f.pw.value.trim().length > 16 || f.pw.value.trim().length<6){
		alert("비밀번호는 6 ~ 16 자로 입력하세요.");
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

function onRev(f) {
	if(f.id.value.trim() == "") {
		alert("삭제할 데이터의 id가 필요합니다.");
		 return false;
	}
	if(f.pw.value.trim().length > 16 || f.pw.value.trim().length<6) {
		alert("비밀번호는 6 ~ 16 자 입니다.");
		 f.pw.focus();
		 return false;
	}
	return true;
}

$(".page-item").click(function(){
	var n =	$(this).data("page");
	if(n !== undefined) location.href = "/gbook/li/"+n;
});

//상세내용보기 - modal POPUP
$("#gbook-tb td").not(":last-child").click(function(){
	var id = $(this).parent().children("td").eq(0).text();
	$.ajax({
		type: "get",
		url: "/api/modalData",
		data: {id: id},
		dataType: "json",
		success: function (res) {
			$("#gbook-modal tr").eq(0).children("td").eq(1).html(res.writer);
			$("#gbook-modal tr").eq(1).children("td").eq(1).html(dspDate(new Date(res.wtime)));
			$("#gbook-modal tr").eq(2).find("div").html(res.comment);
			$("#gbook-modal").modal("show");
		}
	});
	//          td 부모한테 그중 0번째 아이의 글을 찾아서 변수id에 담음.
})

//삭제기능
$(".btRev").click(function(){
	var id = $(this).parent().parent().children("td").eq(0).text(); 
	//버튼으로 부터 찾아감.
	$("form[name='removeForm']").find("input[name='id']");
	$("#remove-modal").find("input[name='id']").val(id);
	$("#remove-modal").find("input[name='pw']").val('');
	$("#remove-modal").modal("show");
});
	$("#remove-modal").on("shown.bs.modal",function(){
		$("#remove-modal").find("input[name='pw']").focus();	
	});
	//$("#remove-modal").find("input[name='pw']").focus();//보류
	//document.removeForm.pw.focus();
// $("#bt-close").click(function(){
// 	$("#gbook-modal").modal("hide");
// });


//수정기능 클라이언트스크립트/서버는 데이터베이스를 처리
$(".btChg").click(function(){
	var id = $(this).parent().parent().children("td").eq(0).text();
	$("#update-modal").find("input[name='id']").val(id);
	upAjax(id);
});

function onReset() {
	var id = $("form[name='upForm']").find("input[name='id']").val();
	var pw = $("form[name='upForm']").find("input[name='pw']").val("");
	upAjax(id,pw);
}

function upAjax(id){
	$.ajax({
		type: "get",
		url: "/api/modalData",
		data: {id: id},
		dataType: "json",	
		success: function (res) {
			$("form[name='upForm']").find("input[name='writer']").val(res.writer);
			$("form[name='upForm']").find("textarea[name='comment']").val(res.comment);
			$("#update-modal").modal("show");
		}
	});
};

//if($(f).find("input[name=''writer]").val().trim();) <-jQuery
	//if(f.writer.value.trim()) <-javascript