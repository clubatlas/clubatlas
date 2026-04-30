# ClubAtlas 구현 상태

> 최종 업데이트: 2026-02-14

## 📋 목차
- [완료된 기능](#완료된-기능)
- [진행 중인 기능](#진행-중인-기능)
- [미구현 기능](#미구현-기능)
- [기술 스택](#기술-스택)
- [다음 단계](#다음-단계)

---

## ✅ 완료된 기능

### 1. 인증 시스템 (Authentication)

#### 1.1 백엔드 인증 API ✅
**위치**: `backend/app/api/auth.py`
- ✅ 학생 회원가입 (`POST /api/auth/signup/student`)
  - 이메일/비밀번호 검증 (강화된 정책: 8자 이상, 대소문자, 숫자)
  - Firebase Authentication 연동
  - Firestore 프로필 자동 생성
- ✅ 리더 권한 요청 (`POST /api/auth/leader-access/request`)
- ✅ 현재 사용자 정보 조회 (`GET /api/auth/me`)
- ✅ 내 리더 권한 요청 상태 확인 (`GET /api/auth/leader-access/my-request`)

**위치**: `backend/app/api/admin/leader_requests.py`
- ✅ 모든 리더 권한 요청 조회 (`GET /api/admin/leader-requests`)
- ✅ 특정 요청 상세 조회 (`GET /api/admin/leader-requests/{id}`)
- ✅ 요청 승인 (`POST /api/admin/leader-requests/{id}/approve`)
- ✅ 요청 거부 (`POST /api/admin/leader-requests/{id}/reject`)
- ✅ 사용자 역할 직접 변경 (`PUT /api/admin/leader-requests/users/{uid}/role`)

#### 1.2 역할 기반 접근 제어 (RBAC) ✅
**백엔드**: `backend/app/api/dependencies.py`, `backend/app/middleware/firebase_auth.py`
- ✅ Firebase Custom Claims 설정
- ✅ Firestore 역할 동기화
- ✅ 의존성 함수
  - `get_current_user`: 인증된 사용자 확인
  - `require_admin`: Admin/ClubLeader 권한 확인
  - `require_club_leader`: ClubLeader 권한 확인
  - `require_super_admin`: SuperAdmin 권한 확인

**프론트엔드**: `src/components/ProtectedRoute.tsx`, `src/contexts/AuthContext.tsx`
- ✅ `ProtectedRoute` 컴포넌트로 라우트 보호
- ✅ `AuthContext`로 전역 인증 상태 관리
- ✅ 역할별 헬퍼 함수 (`isStudent`, `isClubLeader`, `isSuperAdmin`, `hasRole`)

#### 1.3 프론트엔드 인증 로직 ✅
**로그인 페이지**:
- ✅ `src/app/student/login/page.tsx` - 학생 로그인
- ✅ `src/app/admin/login/page.tsx` - Admin/SuperAdmin 로그인 (탭 전환)

**회원가입 페이지**:
- ✅ `src/app/student/signup/page.tsx` - 학생 회원가입
- ✅ `src/app/admin/request-access/page.tsx` - 리더 권한 요청

**레이아웃 보호**:
- ✅ `/student/home/*` - `requireAuth=true`
- ✅ `/admin/dashboard/*` - `requireAuth=true, requiredRole="club-leader"`
- ✅ `/superadmin/*` - `requireAuth=true, requiredRole="super-admin"`

#### 1.4 초기 SuperAdmin 계정 ✅
**위치**: `backend/scripts/create_superadmin.py`
- ✅ 계정 정보:
  - 이메일: `superadmin@gmail.com`
  - 비밀번호: `Super123`
  - 이름: `superadmin`
- ✅ Firebase Authentication 계정 생성
- ✅ Firestore 프로필 생성
- ✅ Custom Claims 설정 (`role: super-admin`)

---

### 2. 사용자 관리 (User Management)

#### 2.1 로그아웃 기능 ✅
**구현 위치**:
- ✅ `src/app/student/home/components/Header.tsx` - 프로필 드롭다운 메뉴
- ✅ `src/app/admin/dashboard/components/DashboardHeader.tsx` - 로그아웃 버튼
- ✅ `src/app/superadmin/dashboard/components/SuperAdminHeader.tsx` - 로그아웃 버튼

**기능**:
- ✅ Firebase `signOut()` 호출
- ✅ 역할별 로그인 페이지로 리다이렉트

#### 2.2 프로필 편집 ✅
**공통 컴포넌트**: `src/components/EditProfileModal.tsx`
- ✅ Display Name 변경
- ✅ 이메일 표시 (변경 불가)
- ✅ 실시간 프로필 새로고침

**통합 위치**:
- ✅ Student Header - "Edit Profile" 메뉴 항목
- ✅ Admin Dashboard Header - Settings 버튼
- ✅ SuperAdmin Header - Settings 버튼

**백엔드 API**: `backend/app/api/users.py`
- ✅ `POST /api/users/profile` - 프로필 생성/업데이트
- ✅ `GET /api/users/profile` - 내 프로필 조회
- ✅ `PUT /api/users/interests` - 관심사 업데이트

---

### 3. SuperAdmin 기능

#### 3.1 리더 권한 요청 관리 UI ✅
**위치**: `src/app/superadmin/club-leaders/page.tsx`

**기능**:
- ✅ 탭 기반 UI
  - "Current Leaders" - 기존 리더 목록 (더미 데이터)
  - "Pending Requests" - 대기 중인 권한 요청
- ✅ `PendingRequestsTable.tsx` - 요청 목록 테이블
  - 요청자 정보 (이름, 이메일, 요청 클럽, 직책)
  - 요청 날짜, 사유
  - 승인/거부 버튼
- ✅ `ApproveRequestModal.tsx` - 승인 모달
  - 동아리 선택 (Clubs API 연동)
  - Admin Notes (선택)
  - 승인 시 자동으로:
    - 사용자 역할 → `club-leader`
    - 동아리 leaders 배열에 추가
    - 요청 상태 → `approved`
- ✅ `RejectRequestModal.tsx` - 거부 모달
  - 거부 사유 입력 (필수)
  - 요청 상태 → `rejected`

---

### 4. API 클라이언트

**생성된 파일**:
- ✅ `src/lib/api/auth.ts` - 인증 관련 API
- ✅ `src/lib/api/admin.ts` - SuperAdmin 전용 API
- ✅ `src/lib/api/clubs.ts` - 동아리 관련 API
- ✅ `src/lib/api/users.ts` - 사용자 관련 API
- ✅ `src/lib/api/client.ts` - 공통 API 클라이언트 (자동 토큰 주입)

---

### 5. Firebase 설정

#### 5.1 Firebase 프로젝트 ✅
- ✅ Firebase Console 프로젝트 생성
- ✅ Authentication 활성화 (Email/Password)
- ✅ Firestore Database 생성
- ✅ Web App 등록 및 구성 정보 획득
- ✅ Service Account Key 다운로드

#### 5.2 환경 변수 ✅
**프론트엔드**: `.env.local`
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**백엔드**: `backend/.env`
```
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY_PATH=./serviceAccountKey.json
ALLOWED_ORIGINS=http://localhost:3000
```

#### 5.3 Firestore 보안 규칙 ✅
**위치**: `firestore.rules`
- ✅ 역할 기반 접근 제어 규칙
- ✅ 컬렉션별 권한 설정
  - `users`: 본인 읽기/쓰기
  - `clubs`: 공개 읽기, 리더만 쓰기
  - `leader_access_requests`: 본인 및 SuperAdmin 접근

---

### 6. 학생 페이지 기능 ✅

#### 6.1 검색 기능 (Student Header) ✅
**위치**: `src/app/student/home/components/Header.tsx`
- ✅ 검색 드롭다운 UI
- ✅ 클럽 및 이벤트 통합 검색
- ✅ 실시간 검색 결과 표시
- ✅ 검색 결과 클릭 시 해당 페이지로 이동
- ✅ 검색 결과 섹션 구분 (Clubs / Events)
- ✅ 최소 2자 이상 입력 시 검색
- ✅ 검색어 기반 필터링 (이름, 설명, 카테고리)

**API 연동**: `getClubs()`, `getEvents()`

#### 6.2 Student Calendar - Export 기능 ✅
**위치**: `src/app/student/home/calendar/page.tsx`
- ✅ iCalendar (.ics) 포맷으로 내보내기
- ✅ 현재 월의 이벤트 데이터 포함
- ✅ 표준 iCal 필드 지원:
  - VEVENT (이벤트)
  - SUMMARY (제목)
  - DTSTART/DTEND (시작/종료 시간)
  - LOCATION (장소)
  - DESCRIPTION (설명)
- ✅ 파일 다운로드 자동화
- ✅ 이벤트가 없을 경우 경고 표시

#### 6.3 Student Calendar - Create Event 기능 (Club Leader 전용) ✅
**위치**: `src/app/student/home/calendar/components/CreateEventModal.tsx`
- ✅ Club Leader만 "Create" 버튼 표시
- ✅ 관리 중인 클럽 목록 동적 로드
- ✅ 이벤트 생성 API 연동 (`createEvent`)
- ✅ 필수 필드 검증:
  - 이벤트 제목
  - 클럽 선택
  - 날짜 및 시간 (시작/종료)
  - 장소
  - 설명
- ✅ DatePicker 컴포넌트 통합
- ✅ 이벤트 생성 후 캘린더 자동 새로고침
- ✅ 로딩 상태 및 에러 처리
- ✅ 성공 시 모달 자동 닫기

**API 연동**: `createEvent()`, `getClub()`

**역할 기반 접근 제어**:
- Club Leader 및 Admin만 Create 버튼 표시
- 일반 학생은 버튼 숨김 처리

---

## 🚧 진행 중인 기능

### 현재 진행 중인 항목 없음

모든 계획된 인증 기능(1~3, 5, 7단계)이 완료되었습니다.

---

## ❌ 미구현 기능

### 1. 비밀번호 재설정 (6단계)
**예정 위치**: `src/app/student/login/components/ForgotPasswordModal.tsx`

**필요 기능**:
- [ ] Firebase Password Reset Email 발송
- [ ] 비밀번호 재설정 모달 UI
- [ ] 이메일 입력 후 재설정 링크 발송
- [ ] 성공/실패 메시지 표시

**백엔드**: Firebase Admin SDK의 `generatePasswordResetLink()` 사용 가능

---

### 2. 실제 동아리 데이터 연동
**현재 상태**: 
- Clubs API는 구현되어 있음 (`backend/app/api/clubs.py`)
- 프론트엔드는 일부 더미 데이터 사용 중

**필요 작업**:
- [ ] `/superadmin/club-leaders` Current Leaders 탭에서 실제 Firestore 데이터 사용
- [ ] 더미 데이터를 Firestore에 마이그레이션
- [ ] 모든 페이지에서 실제 API 호출로 전환

---

### 3. AI 추천 시스템
**위치**: `backend/app/services/recommendation_service.py`

**구현된 내용**:
- ✅ Hybrid Collaborative Filtering 알고리즘
- ✅ Content-based + Collaborative Filtering
- ✅ 백엔드 API (`GET /api/recommendations/personalized`)

**미구현**:
- [ ] 프론트엔드 AI Recommendations 페이지 실제 API 연동
- [ ] 추천 결과 표시 및 UI 개선
- [ ] 사용자 피드백 수집 (좋아요/싫어요)

---

### 4. 이벤트 관리
**백엔드**: `backend/app/api/events.py` (존재하지 않음)

**필요 기능**:
- [ ] 이벤트 CRUD API
- [ ] 출석 체크 기능
- [ ] 이벤트 알림 시스템
- [ ] 캘린더 통합

---

### 5. 구독 시스템
**백엔드**: `backend/app/api/subscriptions.py` (존재하지 않음)

**필요 기능**:
- [ ] 동아리 구독 API
- [ ] 구독 알림 설정
- [ ] 구독 통계

---

### 6. Admin Dashboard 실제 데이터 연동
**현재 상태**: 대부분 더미 데이터 사용

**필요 작업**:
- [ ] 동아리 프로필 편집 (기존 페이지 있음)
- [ ] 이벤트 생성/관리 실제 API 연동
- [ ] 공지사항 생성/관리 실제 API 연동
- [ ] 구독자 관리 실제 데이터 연동
- [ ] 통계 대시보드 실제 데이터 표시

---

### 7. Student 페이지 기타 기능
**필요 작업**:
- [ ] Collaborations 페이지 구현

---

### 8. 검색 및 필터링 고도화 (선택적 개선 사항)
**현재 상태**: 기본 검색 기능 구현 완료
- ✅ Student Header 검색 (클럽 및 이벤트)
- ✅ Browse Clubs 필터링 및 검색

**추가 개선 사항 (선택적)**:
- [ ] 전체 텍스트 검색 (Algolia 또는 Elasticsearch)
- [ ] 고급 필터링 옵션
- [ ] 자동완성 기능

---

### 9. 알림 시스템
- [ ] 실시간 알림 (Firebase Cloud Messaging)
- [ ] 이메일 알림
- [ ] 알림 설정 관리

---

### 10. 파일 업로드
- [ ] Firebase Storage 통합
- [ ] 이미지 업로드 (동아리 로고, 배너, 갤러리)
- [ ] 파일 크기 제한 및 검증

---

## 🛠 기술 스택

### Frontend
- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript
- **스타일링**: CSS Modules
- **인증**: Firebase Authentication (Client SDK)
- **상태 관리**: React Context API
- **HTTP 클라이언트**: Fetch API (Custom Wrapper)

### Backend
- **프레임워크**: FastAPI
- **언어**: Python 3.10+
- **데이터베이스**: Firebase Firestore
- **인증**: Firebase Admin SDK
- **데이터 검증**: Pydantic
- **CORS**: FastAPI Middleware

### Infrastructure
- **호스팅**: Firebase App Hosting (예정)
- **데이터베이스**: Firestore
- **스토리지**: Firebase Storage (미구현)
- **인증**: Firebase Authentication

---

## 📝 다음 단계 (우선순위)

### 단기 (1-2주)
1. **비밀번호 재설정 기능 구현** (6단계)
2. **더미 데이터를 Firestore로 마이그레이션**
   - `backend/scripts/create_dummy_data.py` 실행
   - 실제 동아리, 사용자, 이벤트 데이터 생성
3. **Admin Dashboard 실제 데이터 연동**
   - 이벤트 생성/편집 API 연동
   - 공지사항 CRUD API 구현 및 연동

### 중기 (3-4주)
4. **이벤트 관리 시스템 완성**
   - 백엔드 Events API 구현
   - 출석 체크 기능
   - 캘린더 통합
5. **구독 시스템 구현**
   - Subscriptions API
   - 알림 설정
6. **AI 추천 시스템 프론트엔드 연동**

### 장기 (1-2개월)
7. **검색 및 필터링 고도화**
8. **알림 시스템** (FCM, Email)
9. **파일 업로드** (Firebase Storage)
10. **성능 최적화 및 테스트**

---

## 📚 관련 문서
- [AUTHENTICATION_DESIGN.md](./AUTHENTICATION_DESIGN.md) - 인증 시스템 상세 설계
- [DEVELOPMENT.md](./DEVELOPMENT.md) - 개발 가이드
- [TESTING.md](./TESTING.md) - 테스트 가이드
- [README.md](./README.md) - 프로젝트 개요

---

## 📌 중요 메모

### 완료된 주요 마일스톤
1. ✅ Firebase 프로젝트 설정 완료 (2026-01-31)
2. ✅ 3-Role 인증 시스템 구현 완료 (Student, ClubLeader, SuperAdmin)
3. ✅ SuperAdmin 초기 계정 생성 및 로그인 성공
4. ✅ 로그아웃 기능 전체 역할에 구현
5. ✅ 프로필 편집 기능 전체 역할에 구현
6. ✅ SuperAdmin 리더 권한 요청 관리 UI 완성

### 테스트 완료 항목
- ✅ SuperAdmin 로그인 (`superadmin@gmail.com` / `Super123`)
- ✅ SuperAdmin 대시보드 접근
- ✅ 역할 기반 접근 제어 (ProtectedRoute)

### 보안 주의사항
- ⚠️ 프로덕션 배포 시 SuperAdmin 비밀번호 반드시 변경 필요
- ⚠️ Firebase API Key 및 Service Account Key 절대 커밋하지 말 것
- ⚠️ CORS 설정을 프로덕션 도메인으로 제한할 것

---

**마지막 업데이트**: 2026-01-31  
**작성자**: AI Coding Assistant  
**프로젝트 상태**: 인증 시스템 완료, 추가 기능 개발 진행 예정
