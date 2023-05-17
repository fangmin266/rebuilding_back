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
// services name = depends_on = .env 환경변수 host명 동일한지 check
// networks 설정되어있는지 check (동일 네트워크선상이어야 함)

=> unable to connect to server: connection failed: connection refused 에러 해결
```

2. passport integration
3. jwt strategy
4. email verification
5. thrid party - bootpay & twilio
