/* 
//Javascript Ajax
var page=1
var url ="/gbook_ajax" + page;
var xhr = new XMLHttpRequest();
xhr.open("GET",url);
xhr.send(data);

xhr.addEventListener('load',function(){
	console.log(xhr.responseText);
}); */

//ajax("/gbook_ajax",{page:1})
// ajax("/gbook_ajax", "get", 1, function listCb(data){
// 	console.log(data);
// });

// function ajax(url, vals, cb){
// 	var data = {};//{객체를 만들때}
// 	if(typeof vals == object)	data=vals;
// 	//vals변수의 타입 ==ob라면
// 	//	data = vals; ->ajax("/gbook_ajax",{page:1})
// 	else url = url + "/" + vals;	
// 	$.ajax({
// 		type: "get",
// 		url: url,
// 		// url: "/gbook_ajax/" + page,=>params
// 		// data: {page:1}(req)
// 		//        변수에 담겨서 보내짐으로 query ?pagq1
// 		//req방식 3가지-query,params,body(post)
// 		data: data,
// 		dataType: "json",
// 		success: cb
// 	});
// }
function getPage(page) {
	var grpCnt = 5;
	var divCnt = 3;
	ajax("/gbook_ajax/"+page, "get", {grpCnt: grpCnt}, function 
	(data){                             //한페이지에 보여지는 갯수
		//page 1요청을 받으면 cb함수을 실행.
		//1->(util-사용자 정의 ajax함수.)
		console.log(data); //배열안의 자바개체
		//console.log(data[0]); //자바개체 
		var totCnt = data.totCnt; //데이터 전체갯수(pager를 위해서 만들어놓음.)
		/* 
	totcnt:2,
	rs:[
		{id:1, comment:"",wtime:"",writer:""},
		{id:1, comment:"",wtime:"",writer:""}
	]
*/
		var rs = data.rs; //1페이지에 보여질 데이터
		var html = '';

		$(".gbook-tb > tbody").empty();
		//내용을 지우고 작성되어있는 내용을 가져옴.
		for (var i in rs) {
			html = '<tr>';
			html += '<td>' + rs[i].id + '</td>';
			html += '<td>' + rs[i].writer + '</td>';
			html += '<td>' + dspDate(new Date(rs[i].wtime)) + '</td>';
			html += '<td>' + rs[i].comment + '</td>';
			html += '<td>';
			html += '<button class="btn btn-success btn-sm">수정</button>';
			html += '<button class="btn btn-danger btn-sm">삭제</button>';
			html += '</td>';
			$(".gbook-tb > tbody").append(html);
		}
		//pagerMaker($pager. grpcnt, totCnt, page) ->java객체로도 바꿔볼 것.
		pagerMaker($(".pager"), grpCnt, divCnt, totCnt, page, function () {
			if(!$(this).hasClass("disabled")) getPage($(this).data("page"));
		});
	});
}
getPage(1);