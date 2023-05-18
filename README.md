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

- 상대경로 설정 : tsconfig.paths.json /tsconfig.json에 확장
- jwt 생성과 활용

```
userId 활용하여 jwt token 생성
strategy, guard 설정
: param 필수값 및 검증 체크
```

4. email verification / third party(Bootpay, Twilio)

- email verification

```
회원가입시 jwt토큰 포함한 인증메일발송(id) 및 확인(디코딩) - 노드메일러
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
