# ClubAtlas Firebase 배포 가이드

Firebase를 이용한 배포 구성: **프론트엔드(Next.js)**는 Firebase App Hosting, **백엔드(FastAPI)**는 Google Cloud Run, **Firestore/Storage 규칙**은 Firebase CLI로 배포합니다.

---

## 1. 사전 요구사항

- Node.js 18+
- Python 3.10+
- [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools` 후 `firebase login`
- Google Cloud 프로젝트 = Firebase 프로젝트 (동일 프로젝트 사용)

---

## 2. Firebase 프로젝트 설정

1. [Firebase Console](https://console.firebase.google.com)에서 프로젝트 생성 또는 기존 프로젝트 선택
2. **Authentication** → 이메일/비밀번호 사용 설정
3. **Firestore Database** 생성
4. **Storage** 사용 설정
5. **.firebaserc**에서 프로젝트 ID 설정:
   ```json
   {"projects":{"default":"실제-프로젝트-ID"}}
   ```
   (`your-project-id`를 Firebase 콘솔의 프로젝트 ID로 교체)

---

## 3. Firestore·Storage 규칙 배포

프론트/백엔드 배포와 무관하게 규칙만 먼저 배포할 수 있습니다.

```bash
firebase deploy --only firestore,storage
```

---

## 4. 프론트엔드 (Next.js) — Firebase App Hosting

Firebase App Hosting은 Next.js(SSR 포함)를 지원합니다.

1. [Firebase Console](https://console.firebase.google.com) → 프로젝트 → **Build** → **App Hosting**
2. **Get started** → GitHub 저장소 연결 후 ClubAtlas 저장소 선택
3. **Root directory**: 저장소 루트(또는 Next.js 앱이 있는 디렉터리)
4. **Framework preset**: Next.js
5. **Environment variables**에 다음 추가:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_API_URL` = **배포된 백엔드 URL** (예: `https://your-api-xxxx.run.app`)
6. 빌드 후 자동 배포되며, 호스트 URL이 부여됩니다.

App Hosting을 쓰지 않는 경우(정적만 필요할 때)는 Next.js를 `output: 'export'`로 빌드한 뒤 **Firebase Hosting**에 `out` 디렉터리를 배포하는 방식도 가능합니다. 이 프로젝트는 동적 라우트(`/student/home/clubs/[id]`)가 있어 App Hosting 사용을 권장합니다.

---

## 5. 백엔드 (FastAPI) — Google Cloud Run

백엔드는 Firebase가 아닌 **Cloud Run**에 배포합니다. 같은 Google Cloud 프로젝트를 사용하면 됩니다.

### 5.1 Docker 이미지 빌드 및 푸시

프로젝트 루트에서:

```bash
cd backend
docker build -t gcr.io/실제-프로젝트-ID/clubatlas-api .
docker push gcr.io/실제-프로젝트-ID/clubatlas-api
```

(이미지 레지스트리가 **Artifact Registry**인 경우 `gcr.io` 대신 해당 리전 경로 사용, 예: `europe-west1-docker.pkg.dev/...`)

### 5.2 Cloud Run 서비스 생성

- **Console**: Cloud Run → 서비스 만들기 → 이미지 선택 → 서비스 계정에 Firestore 등 권한 부여
- **gcloud** 예시:
  ```bash
  gcloud run deploy clubatlas-api \
    --image gcr.io/실제-프로젝트-ID/clubatlas-api \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated
  ```

### 5.3 환경 변수 (Cloud Run)

Cloud Run 서비스의 **환경 변수**에 다음을 설정합니다.

| 변수 | 설명 |
|------|------|
| `FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID |
| `FIREBASE_PRIVATE_KEY` | 서비스 계정 JSON의 `private_key` (줄바꿈은 `\n` 그대로) |
| `FIREBASE_CLIENT_EMAIL` | 서비스 계정 `client_email` |
| `FIREBASE_CLIENT_ID` | (선택) `client_id` |
| `FIREBASE_PRIVATE_KEY_ID` | (선택) `private_key_id` |
| `FIREBASE_CLIENT_X509_CERT_URL` | (선택) `client_x509_cert_url` |
| `ALLOWED_ORIGINS` | 프론트엔드 URL (App Hosting URL), 예: `https://your-app.web.app,https://your-app.firebaseapp.com` |

서비스 계정 키는 Firebase Console → 프로젝트 설정 → 서비스 계정 → 새 비공개 키 생성에서 받을 수 있습니다.

---

## 6. 배포 후 확인

1. **프론트엔드**: App Hosting URL로 접속 → 로그인·동아리 목록·추천 등 동작 확인 https://clubatlasbackend--clubatlas-ecaa4.us-east4.hosted.app/
2. **백엔드**: `https://배포된-API-URL/health` 호출 시 `{"status":"healthy"}` 확인
Service URL: https://clubatlas-api-1027306571468.us-central1.run.app
3. **CORS**: 브라우저에서 API 호출 시 차단되지 않는지 확인 (필요 시 `ALLOWED_ORIGINS`에 실제 프론트 도메인 추가)

---

## 7. 요약

| 구성 요소 | 배포 대상 | 명령/방법 |
|-----------|-----------|-----------|
| Firestore 규칙, 인덱스 | Firebase | `firebase deploy --only firestore` |
| Storage 규칙 | Firebase | `firebase deploy --only storage` |
| Next.js 앱 | Firebase App Hosting | Console에서 GitHub 연결 후 자동 빌드·배포 |
| FastAPI 백엔드 | Cloud Run | Docker 빌드 후 `gcloud run deploy` |

프로덕션 전에 SuperAdmin 비밀번호 변경, API 키/서비스 계정 키 보안 관리, CORS·Firestore 규칙 재검토를 권장합니다.
