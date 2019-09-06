# SQL을 배워봅시다.
## 데이터추가
### 구문 1
```sql
INSERT INTO 테이블명 SET 컬럼명='값', 컬럼명='값'
#예제
INSERT INTO gbook set comment='내용입니다.', wtime='2019-09-02 13:27:00;'
```
### 구문2
```sql
INSERT INTO 테이블 명(컬럼명,컬럼명....) VALUES(값,값....)
#예제
INSERT INTO gbook ('comment','wtime') VALUES('안녕하세요','2019-09-03 13:30:00')
```

## 데이터 가져오기
###구문 1
```sql
--가져오기
SELECT 컬럼명, 컬럼명..FROM gbook
SELECT * FROM gbook

--순서를 정렬해서 가져오기
--오름차순
SELECT * FROM gbook ORDER BY id ASC 
--내림차순
SELECT * FROM gbook ORDER BY id DESC 

--원하는 데이터만 가져오기
SELECT * FROM gbook WHERE id=5 & id>10
SELECT * FROM gbook WHERE wtime>'2019-09-01 00:00:00' ORDER BY wtime DESC 
--HS는 문자가 아니여서 연산이 가능하다.
SELECT * FROM gbook WHERE comment = '하이' --하이루,하이요X
SELECT * FROM gbook WHERE comment  LIKE = '%하이%' ORDER BY id DESC
--하이를 포함한 문자를 다 가져옴. 
--%뒤에있으면 하이로 시작하는 모든 문자
--%앞에있으면 하이로 끝나는 모든 문자

--원하는 갯수만 가져오기
SELECT * FROM gbook WHERE comment LIKE '%마디%' ORDER BY id DESC LIMIT 0,5 --몇번째, 몇개가져오기 
SELECT * FROM gbook WHERE comment LIKE '%마디%' ORDER BY id DESC LIMIT 10,5 

--레코드의 갯수를 가져오기
SELECT count(id) FROM gbook
```


## 데이터 삭제

##  수정

## 데이터 가져오기