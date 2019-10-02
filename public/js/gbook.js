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

$(".page-item").click(function () {
	var n = $(this).data("page");
	if (n !== undefined) location.href = "/gbook/li/" + n;
});

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
		success: function (res) { //모든내용이 담김.
			$("#gbook-modal").find(".img-tr").addClass("d-none");
			$("#gbook-modal").find(".img-tr").find("img").attr("src", "");
			$("#gbook-modal").find(".file-tr").addClass("d-none");
			$("#gbook-modal").find(".file-tr").find("a").attr("href", "#");
			$("#gbook-modal").find(".file-tr").find("a").text("");
			if (res.savefile != null && res.savefile != "") { //null이 아니고 빈값이 아니라면
				var file = splitName(res.savefile); //util을 심어놨기 때문에 접근이 가능하다.
				var ext = file.ext.toLowerCase(); //파일이름 소문자로
				var ts = Number(file.name.split("-")[0]); //-로 분리하고 배열해서 0번째값이 타임스탬프
				//var d = new Date(ts);//저장된 파일의 날짜.->폴더를 찾기 위해서....
				var dir = findPath(new Date(ts));
				var imgPath = "/uploads/" + dir + "/" + res.savefile;//이미지 path
				var downPath = "/download?fileName="+res.savefile+"&downName="+res.orifile;//파일path

				if (fileExt.indexOf(ext) > -1) { //이미지로 찾으면 해커의 py가 안걸림.파일도 안걸림
					//첨부파일
					$("#gbook-modal").find(".file-tr").removeClass("d-none");
					$("#gbook-modal").find(".file-tr").find("a").attr("href", downPath);
					$("#gbook-modal").find(".file-tr").find("a").text(res.orifile);
				} else { //파일은 abcpy가 실행되어버리면 해킹 될 수도 있기에 먼저 파일을 진행후 이미지를 작업하면 이미지는 이미지를 보여주기 위해 에러가 남. 보안을 해줄 수 있음.
					//첨부이미지
					$("#gbook-modal").find(".img-tr").removeClass("d-none");
					$("#gbook-modal").find(".img-tr").find("img").attr("src", imgPath);
				}
			}

			$("#gbook-modal tr").eq(0).children("td").eq(1).html(res.writer);
			$("#gbook-modal tr").eq(1).children("td").eq(1).html(dspDate(new Date(res.wtime)));
			$("#gbook-modal tr").eq(2).find("div").html(res.comment);
			$("#gbook-modal").modal("show");
		}
	});
	//          td 부모한테 그중 0번째 아이의 글을 찾아서 변수id에 담음.
})

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
		data: {
			id: id
		},
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