# ClubAtlas 테스트 가이드

## 빠른 시작 테스트

### 1. 백엔드 서버 테스트

```bash
cd backend
python run.py
```

**확인 사항:**
- 서버가 `http://localhost:8000`에서 실행되는지 확인
- 브라우저에서 `http://localhost:8000/docs` 접속하여 API 문서 확인
- `http://localhost:8000/health` 접속하여 `{"status": "healthy", "service": "ClubAtlas API"}` 응답 확인

### 2. 프론트엔드 서버 테스트

```bash
npm run dev
```

**확인 사항:**
- 서버가 `http://localhost:3000`에서 실행되는지 확인
- 브라우저에서 `http://localhost:3000` 접속하여 Welcome 페이지 확인
- 페이지가 Figma 디자인과 일치하는지 확인

### 3. API 연결 테스트

**방법 1: 브라우저 콘솔 사용**
1. 프론트엔드 페이지에서 F12로 개발자 도구 열기
2. Console 탭에서 다음 코드 실행:
```javascript
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(console.log)
```

**방법 2: API 테스트 컴포넌트 사용 (개발 모드)**
- Welcome 페이지에 ApiTest 컴포넌트 추가하여 테스트

**방법 3: curl 사용**
```bash
curl http://localhost:8000/health
curl http://localhost:8000/
```

## 체크리스트

### 백엔드
- [ ] FastAPI 서버가 정상적으로 시작됨
- [ ] `/health` 엔드포인트가 `{"status": "healthy"}` 반환
- [ ] `/docs`에서 Swagger UI가 정상적으로 표시됨
- [ ] CORS 설정이 올바르게 작동함 (프론트엔드에서 API 호출 가능)

### 프론트엔드
- [ ] Next.js 서버가 정상적으로 시작됨
- [ ] Welcome 페이지가 정상적으로 렌더링됨
- [ ] 모든 컴포넌트가 올바르게 표시됨 (로고, 카드, 기능 섹션)
- [ ] 반응형 디자인이 모바일/태블릿에서 정상 작동
- [ ] 이미지가 정상적으로 로드됨

### 통합
- [ ] 프론트엔드에서 백엔드 API 호출 가능
- [ ] CORS 오류 없음
- [ ] 두 서버가 동시에 실행 가능

## 문제 해결

### 백엔드가 시작되지 않는 경우
1. Python 버전 확인: `python --version` (3.9+ 필요)
2. 가상환경이 활성화되었는지 확인
3. 의존성이 설치되었는지 확인: `pip list`
4. 포트 8000이 사용 중인지 확인

### 프론트엔드가 시작되지 않는 경우
1. Node.js 버전 확인: `node --version` (18+ 필요)
2. 의존성이 설치되었는지 확인: `npm list`
3. 포트 3000이 사용 중인지 확인

### CORS 오류가 발생하는 경우
1. `backend/.env`에서 `ALLOWED_ORIGINS` 확인
2. 프론트엔드 URL이 허용 목록에 있는지 확인
3. 백엔드 서버 재시작

### API 연결 실패
1. 백엔드 서버가 실행 중인지 확인
2. `NEXT_PUBLIC_API_URL` 환경 변수 확인
3. 브라우저 네트워크 탭에서 요청 확인











