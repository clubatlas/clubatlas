# ClubAtlas 개발 가이드

## 프로젝트 구조

```
ClubAtlas/
├── src/                          # Next.js 프론트엔드
│   ├── app/                      # App Router
│   │   ├── welcome/             # Welcome 페이지
│   │   └── ...
│   └── lib/                      # 공유 라이브러리
│       └── api/                  # API 클라이언트
│           ├── client.ts         # API 클라이언트 유틸리티
│           └── index.ts
├── backend/                      # Python FastAPI 백엔드
│   ├── app/
│   │   ├── main.py              # FastAPI 앱 진입점
│   │   ├── config.py            # 설정 관리
│   │   ├── api/                 # API 엔드포인트
│   │   ├── models/              # 데이터 모델
│   │   ├── services/            # 비즈니스 로직
│   │   └── utils/               # 유틸리티 함수
│   ├── run.py                   # 실행 스크립트
│   └── requirements.txt         # Python 의존성
└── public/                       # 정적 파일
```

## 개발 워크플로우

### 1. 새 기능 개발

#### 프론트엔드
1. `src/app/` 하위에 새 페이지/컴포넌트 생성
2. `src/lib/api/` 에서 API 클라이언트 사용
3. CSS Modules로 스타일링

#### 백엔드
1. `backend/app/api/` 에 새 엔드포인트 추가
2. `backend/app/models/` 에 데이터 모델 정의
3. `backend/app/services/` 에 비즈니스 로직 구현

### 2. API 통신

프론트엔드에서 백엔드 API 호출 예시:

```typescript
import { apiClient, checkHealth } from '@/lib/api';

// GET 요청
const response = await apiClient.get('/health');

// POST 요청
const response = await apiClient.post('/api/clubs', {
  name: 'Example Club',
  description: '...'
});
```

### 3. 환경 변수

#### 프론트엔드
- `.env.local` 파일 사용
- `NEXT_PUBLIC_` 접두사 필요 (클라이언트에서 접근 가능)

#### 백엔드
- `backend/.env` 파일 사용
- `python-dotenv`로 자동 로드

## 테스트

### 프론트엔드 테스트
```bash
npm run lint
```

### 백엔드 테스트
```bash
cd backend
# 향후 pytest 등 추가 예정
```

## 빌드 및 배포

### 프론트엔드 빌드
```bash
npm run build
npm start
```

### 백엔드 배포
```bash
cd backend
# 프로덕션 환경에 맞게 설정 후
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 문제 해결

### 백엔드가 프론트엔드 요청을 차단하는 경우
- `backend/.env`에서 `ALLOWED_ORIGINS` 확인
- CORS 설정 확인

### API 연결 실패
- 백엔드 서버가 실행 중인지 확인
- `NEXT_PUBLIC_API_URL` 환경 변수 확인
- 브라우저 콘솔에서 에러 확인

### 포트 충돌
- 프론트엔드: `package.json`의 `dev` 스크립트 수정
- 백엔드: `backend/.env`의 `PORT` 변경











