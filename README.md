# rebuilding_back

1. authrization

- start nestJS

```
new nest [생성폴더]
```

- database setting
  (env, docker-compose 생성,database.module 생성, app.module 연결)

```
//docker-compose.yaml 중요
networks(컨테이너간 네트워크 연결)
depends_on(의존성 설정, 서비스 먼저 시작)
services name = depends_on = .env 환경변수 host명 동일한지 check
networks 설정되어있는지 check (동일 네트워크선상이어야 함)
=> unable to connect to server: connection failed: connection refused 에러 해결
```

- signup / login with auth.module

```
  error handling - return 값 없는 경우 주의
  //module 의존성 에러 주의
  다른 모듈에서 사용할 service가 exports 되어있는지 확인

```

- passport intergration

```
UseGuard문을 활용한 로그인 간소화(LocalAuthGuard)
strategy, guard 설정
: param 필수값 및 검증 체크
```

- jwt 생성과 활용

```
userId 활용하여 jwt token 생성
strategy, guard 설정
: param 필수값 및 검증 체크
```

4. email verification / third party(Bootpay, Twilio)

- email verification(nodemailer)

```
회원가입시 jwt토큰 포함한 인증메일발송(id) 및 확인(디코딩)
```

- third party 본인인증

```
//Bootpay
Bootpay.setConfiguration({application_id, private_key})
Bootpay.getAccessToken() //토큰 접근
Bootpay.requestAuthentication({인증받는 기기 소유자 정보 param}) //인증번호 발송
Bootpay.confirmAuthentication({receipt_id, otp}) //인증번호 확인
//Twilio
initiatePhoneNumberVerification //인증번호 발송
confirmPhoneVerification //인증번호 확인
//test 시 phone:+8210
```

5. social login (google, naver, kakao, facebook)

```
google - redirection uri 생성하려면 oAuth동의화면 설정필요
kakao - client_id :rest api 키 / redirect_uri : 카카오개발자 >카카오로그인 클릭시 생성가능
```

6. nginx with docker, ssl

```
docker-compose.yaml에 nginx services 추가
nginx(templates, nginx.config) 설정후 포트 설정
```

<img width="1001" alt="스크린샷 2023-05-19 오전 10 41 40" src="https://github.com/fangmin266/rebuilding_back/assets/123913446/23a4b45a-b766-4c1a-9166-2bae5d65534f">
<img width="1001" alt="스크린샷 2023-05-19 오전 10 43 27" src="https://github.com/fangmin266/rebuilding_back/assets/123913446/fa229ec8-dc44-4e8d-8871-43602be7490c">
<img width="1001" alt="스크린샷 2023-05-19 오전 10 42 13" src="https://github.com/fangmin266/rebuilding_back/assets/123913446/4bde09b4-6071-4b7f-858d-389e0bd80017">
<img width="1001" alt="스크린샷 2023-05-19 오전 10 43 07" src="https://github.com/fangmin266/rebuilding_back/assets/123913446/98c92959-e7c0-4735-9ad2-8c568a1a4dfc">

7. interceptor (response 통일)

8. pagination

```
Page<T> 페이징된 데이터와 메타 데이터를 담는 클래스(response)
PageOptionDto 페이지 옵션을 담는 전송 객체(request)
@query : 쿼리빌더의 검색 파라메터
```

9. relation (oneToone / oneToMany / manyToOne )
   <img width="811" alt="스크린샷 2023-05-19 오후 4 48 19" src="https://github.com/fangmin26/ecommerce/assets/79704363/faf91354-53af-42a4-92bf-c3ce8987aad8">

```
oneToMany에서 발생한 에러 : Comment 모듈 잘못 불러온 이슈
```

<img width="694" alt="스크린샷 2023-05-19 오후 5 05 49" src="https://github.com/fangmin26/ecommerce/assets/79704363/24d21b65-d3c4-4975-91d1-6d14753e26eb">
<img width="694" alt="스크린샷 2023-05-19 오후 5 05 59" src="https://github.com/fangmin26/ecommerce/assets/79704363/a64b158f-74a2-451f-aa3a-129d7cf18980">

```
Comment service 단에서 product repository부르기 위해 imports 추가
```

10. password change

```
email로 토큰 생성하여 비밀번호변경
```

11. open api data save (library) with cron

12. accessToken , refreshToken

13. redis in memory(추가,삭제 업데이트)

```
redis, redis-commander docker-compose.yaml services에 추가후 volume 에 추가해 줄것
nestjs 도커 서버 start되면 http://localhost:8081/로 접속하여 redis cache 확인
--------------------------------------------------------------------
docker 사용하지 않고 로컬에서 RedisInsight 샤용할시 포그라운드실행필요 (redis-server)
```

14. schedule module?(cron?)
    정기 구독이나 정기 결제시 많이 사용하는 기능

15. throttler
    ddos 공격에 대비하기 위한 속도 제한 기술

-사용하려는 모듈에 전역적으로 설치할경우

```
module imports에 ttl, limit 설정 + provider에 추가 옵션값 설정
```

<img width="1040" alt="스크린샷 2023-05-22 오후 3 33 33" src="https://github.com/fangmin266/rebuilding_back/assets/123913446/4ccb4894-65ee-4bf3-bff3-3093c66daa7d">

-개별 controller에 사용할 경우

```
module imports에 ttl, limit 설정 + 개별 controller에 useGuard로 추가
```

https://docs.nestjs.com/security/rate-limiting

15. s3 이미지 추가

16. 기타

- 상대경로 설정 : tsconfig.paths.json /tsconfig.json에 확장
- gravatar (랜덤 이미지 생성)
- swagger
- ssl
  https://peiiload.tistory.com/54
- healthcheck with terminus
- gratapa prometheus(monitoring tool)
- throttler
  -----------------------------미처리

- 시스템 설계도(overview.html)
- 시퀀스다이어그램
- s3 이미지처리
- jwtFromRequest부분 찾아보기
