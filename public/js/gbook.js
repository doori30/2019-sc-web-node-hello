function onSend(f) {
	console.log(f);
	//return true;-> 리턴값을 받아 전송됨.
	if (f.comment.value.trim() == "") {
		alert("작성자를 입력하세요.");
		f.writer.focus();
		return false;
	}
	if (f.pw.value.trim().length > 16 || f.pw.value.trim().length < 6) {
		alert("비밀번호는 6 ~ 16 자로 입력하세요.");
		f.pw.focus();
		return false;
	}
	if (f.comment.value.trim() == "") {
		alert("내용을 입력하세요.");
		f.comment.focus();
		return false;
	}
	return true;
}
// 입력이 없으면  alert창이 뜨고 멈추고
// 입력이 되면 true값을 받아서 전송  (js방식으로 브라우저에서)

function onRev(f) {
	if (f.id.value.trim() == "") {
		alert("삭제할 데이터의 id가 필요합니다.");
		return false;
	}
	if (f.pw.value.trim().length > 16 || f.pw.value.trim().length < 6) {
		alert("비밀번호는 6 ~ 16 자 입니다.");
		f.pw.focus();
		return false;
	}
	return true;
}

// $(".page-item").click(function () {
// 	var n = $(this).data("page");
// 	if (n !== undefined) location.href = "/gbook/li/" + n;
// });

//상세내용보기 - modal POPUP
$("#gbook-tb td").not(":last-child").click(function () {
	var id = $(this).parent().children("td").eq(0).text();
	$.ajax({
		type: "get",
		url: "/api/modalData",
		data: {
			id: id
		},
		dataType: "json",
		//success: function (res) { //모든내용이 담김.
		success: function (res) {
			writeAjax(res, "#gbook-modal");
		}
	});
	//(10/7내용내려보냄 공통함수로 )
});

//공통으로 사용하기 위해 수정중 위에 res내용 가져옴.
//상세보기, 수정 화면표현 공통함수.
function writeAjax(res, modal) {
	//초기화
	$(modal).find(".img-tr").addClass("d-none");
	$(modal).find(".img-tr").find("td").eq(0).attr("rowspan", "");
	$(modal).find(".img-tr").find("img").attr("src", "");
	$(modal).find(".file-tr").addClass("d-none");
	$(modal).find(".file-tr").find("td").eq(0).attr("rowspan", "");
	$(modal).find(".file-tr").find("a").attr("href", "#");
	$(modal).find(".file-tr").find("a").text("");
	$(modal).find(".up-td").addClass("d-none");

	//첨부파일 경로 설정
	if (res.savefile != null && res.savefile != "") { //null이 아니고 빈값이 아니라면 //파일이 있다는 전제하에 움직음.
		var file = splitName(res.savefile); //util을 심어놨기 때문에 접근이 가능하다.
		var ext = file.ext.toLowerCase(); //파일이름 소문자로
		var ts = Number(file.name.split("-")[0]); //-로 분리하고 배열해서 0번째값이 타임스탬프
		//var d = new Date(ts);//저장된 파일의 날짜.->폴더를 찾기 위해서....
		var dir = findPath(new Date(ts));
		var imgPath = "/uploads/" + dir + "/" + res.savefile; //이미지 path
		var downPath = "/download?fileName=" + res.savefile + "&downName=" + res.orifile; //파일path

		if (fileExt.indexOf(ext) > -1) { //이미지로 찾으면 해커의 py가 안걸림.파일도 안걸림
			//첨부파일
			$(modal).find(".file-tr").removeClass("d-none");
			$(modal).find(".file-tr").find("td").eq(0).attr("rowspan", "2");
			$(modal).find(".file-tr").find("a").attr("href", downPath);
			$(modal).find(".file-tr").find("a").text(res.orifile);
		} 
		else {
			//파일은 abcpy가 실행되어버리면 해킹 될 수도 있기에 먼저 파일을 진행후 이미지를 작업하면 이미지는 이미지를 보여주기 위해 에러가 남. 보안을 해줄 수 있음.
			//첨부이미지
			$(modal).find(".img-tr").removeClass("d-none");
			$(modal).find(".img-tr").find("td").eq(0).attr("rowspan","2");
			$(modal).find(".img-tr").find("img").attr("src", imgPath);
		}
	}
		else {
			//첨부파일없음
			$(modal).find(".up-td").removeClass("d-none");
			$(modal).find("input[name='upfile']").val("");
		}
	if (modal == "#gbook-modal") {
		$(modal).find("tr").eq(0).children("td").eq(1).html(res.writer);
		$(modal).find("tr").eq(1).children("td").eq(1).html(dspDate(new Date(res.wtime)));
		$(modal).find("tr").eq(2).find("div").html(res.comment);
		$(modal).modal("show");
	} 
	else {
		$(modal).find("input[name='writer']").val(res.writer);
		$(modal).find("textarea[name='comment']").val(res.comment);
		$(modal).modal("show");
	}
}
//          td 부모한테 그중 0번째 아이의 글을 찾아서 변수id에 담음

//삭제기능
$(".btRev").click(function () {
	var id = $(this).parent().parent().children("td").eq(0).text();
	//버튼으로 부터 찾아감.
	$("form[name='removeForm']").find("input[name='id']");
	$("#remove-modal").find("input[name='id']").val(id);
	$("#remove-modal").find("input[name='pw']").val('');
	$("#remove-modal").modal("show");
});
$("#remove-modal").on("shown.bs.modal", function () {
	$("#remove-modal").find("input[name='pw']").focus();
});
//$("#remove-modal").find("input[name='pw']").focus();//보류
//document.removeForm.pw.focus();
// $("#bt-close").click(function(){
// 	$("#gbook-modal").modal("hide");
// });


//수정기능 클라이언트스크립트/서버는 데이터베이스를 처리
$(".btChg").click(function () {
	var id = $(this).parent().parent().children("td").eq(0).text();
	$("#update-modal").find("input[name='id']").val(id);
	upAjax(id);
});

function onReset() {
	var id = $("form[name='upForm']").find("input[name='id']").val();
	var pw = $("form[name='upForm']").find("input[name='pw']").val("");
	upAjax(id, pw);
}

function upAjax(id) {
	$.ajax({
		type: "get",
		url: "/api/modalData",
		data: {id: id},
		dataType: "json",
		success: function (res) {
			writeAjax(res, "#update-modal");
			// $("form[name='upForm']").find("input[name='writer']").val(res.writer);
			// $("form[name='upForm']").find("textarea[name='comment']").val(res.comment);
			// $("#update-modal").modal("show");
		}
	});
};

//if($(f).find("input[name=''writer]").val().trim();) <-jQuery
//if(f.writer.value.trim()) <-javascript

// POPUP
function popOpen () {
setTimeout(function() {//지정시간 뒤 내용을 실행. display:none이면 css자체도 적용을 안시키는 거 같다..(무시)
	$(".popup-bg").css("display","flex"); //두가지를 같이 진행시키면 위에거가 시작할때 같이 시작되면서 결과에 translate가 안먹힌다.
	setTimeout(function() {//그래서 setTimeout을 두번돌려서 위에 작업 후에 진행이 된다.
		$(".popup-wrap").css({"opacity": 1, "transform":"translateY(0)"});
	},100);
}, 500);
}

//$.removeCookie("popChk"); => 팝업창을 꺼도 다시 새로고침할 때 나타남

console.log($.cookie("popChk"));
if($.cookie("popChk") !== "true") popOpen();
//popChk가 문자열 true가 아닌경우 popOpen실행
//true면 지워지는거.

$(".popup-close, .popup-close2").click(function(){
	//attribute - 마음대로 값을 바꿀 수 있는 속성
	//property - 정해져 있는 속성
	//<input type="text" checked>
	//         ->attr    prop
	//$.cookie("변수명","변수값",{expires(cookie가 만료되는 시점):1(하루)});
	var chk = $("#popOut").prop("checked");
	console.log(chk);
	$.cookie("popChk",chk,{expires:1});//쿠키생성- true일때 보이지 않음.
	$(".popup-bg").css("display","none");
	$(".popup-wrap").css({"opacity": 0, "transform":"translateY(-220)"});
});