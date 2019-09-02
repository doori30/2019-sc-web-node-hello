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

## 데이터 삭제

##  수정

## 데이터 가져오기