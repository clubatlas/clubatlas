# ClubAtlas 인증 및 권한 관리 설계 문서

## 1단계: 회원 모델 및 역할 할당 정책 설계

작성일: 2026-01-31
상태: 설계 완료

---

## 1. 역할 모델 정의

### 1.1 역할 종류 및 권한

#### Student (학생)
- **권한 레벨**: 1 (최하위)
- **접근 가능 영역**:
  - `/student/*` - 모든 학생 페이지
  - 동아리 탐색 및 상세 조회
  - 이벤트 캘린더
  - AI 추천
  - 마이페이지
  - 동아리 구독/알림 설정
- **제한 사항**:
  - 동아리 관리 불가
  - 이벤트 생성/수정 불가
  - 관리자 페이지 접근 불가

#### Club Leader (동아리 리더)
- **권한 레벨**: 2
- **접근 가능 영역**:
  - `/admin/*` - 동아리 관리자 대시보드
  - 자신이 관리하는 동아리 프로필 편집
  - 이벤트 생성/수정/삭제
  - 공지사항 게시
  - 구독자 관리
  - **Student 권한도 포함** (학생 페이지 접근 가능)
- **제한 사항**:
  - 자신의 동아리만 관리 가능
  - 다른 동아리 수정 불가
  - 시스템 설정 불가

#### Admin (관리자)
- **권한 레벨**: 2 (Club Leader와 동일)
- **정의**: `admin`은 `club-leader`의 동의어로 사용
- **이유**: 코드베이스에서 `admin`과 `club-leader`를 구분하지 않고 함께 체크함
- **참조**: `backend/app/api/dependencies.py:109`, `firestore.rules:22`

#### Super Admin (최고 관리자)
- **권한 레벨**: 3 (최상위)
- **접근 가능 영역**:
  - `/superadmin/*` - 시스템 관리 페이지
  - 모든 동아리 관리 (생성/수정/삭제)
  - 동아리 리더 권한 부여/회수
  - 사용자 역할 변경
  - 시스템 설정 및 분석
  - **Club Leader + Student 권한도 포함**
- **제한 사항**: 없음 (전체 시스템 접근 가능)

---

## 2. 회원가입 플로우

### 2.1 Student 회원가입
```
[사용자 입력]
├─ 이메일 (필수)
├─ 비밀번호 (필수, 8자 이상)
├─ 이름 (First Name, Last Name)
├─ 학번 (Student ID)
└─ 전공/학과 (Department)

[처리 과정]
1. Firebase Authentication에 계정 생성 (signUp)
2. 백엔드 API 호출: POST /api/auth/signup/student
3. Firestore users 컬렉션에 프로필 생성
   {
     uid: string (Firebase UID)
     email: string
     display_name: string
     student_id: string
     department: string
     role: "student"
     interests: []
     recommendation_preferences: null
     created_at: timestamp
     updated_at: timestamp
   }
4. 자동 로그인 처리
5. /student/home으로 리다이렉션

[결과]
- ✅ 즉시 승인 (수동 승인 불필요)
- ✅ 모든 학생 기능 이용 가능
```

### 2.2 Club Leader 회원가입 (권한 요청)
```
[초기 회원가입]
1. Student로 회원가입 (위 플로우와 동일)
2. /student/home 진입

[리더 권한 요청]
사용자가 /admin/request-access 페이지 방문

[요청 폼 입력]
├─ 이름 (자동 입력: 프로필에서 가져옴)
├─ 이메일 (자동 입력: 프로필에서 가져옴)
├─ 요청할 동아리 (선택 또는 신규 생성 요청)
├─ 직책 (President, Vice President, Treasurer 등)
└─ 요청 사유 (텍스트 입력)

[처리 과정]
1. 백엔드 API 호출: POST /api/auth/leader-access/request
2. Firestore leader_access_requests 컬렉션에 문서 생성
   {
     id: string (자동 생성)
     user_id: string (현재 로그인 사용자 UID)
     email: string
     display_name: string
     requested_club_id: string | null
     requested_club_name: string (신규 생성 요청 시)
     requested_role: string (President, Vice President 등)
     reason: string
     status: "pending"
     requested_at: timestamp
     processed_at: null
     processed_by: null
     admin_notes: null
   }
3. 요청 완료 메시지 표시
4. 이메일 알림 발송 (선택적)

[대기 상태]
- 사용자는 Student 권한으로 계속 이용
- 요청 상태 확인 페이지에서 진행 상황 확인 가능

[SuperAdmin 승인]
SuperAdmin이 /superadmin/club-leaders에서:
1. 요청 목록 조회
2. 요청 상세 확인
3. 승인 또는 거부 결정
   - 승인 시:
     a. Firebase Custom Claims 설정: {"role": "club-leader"}
     b. Firestore users/{uid} 업데이트: role = "club-leader"
     c. 동아리에 리더 추가 (clubs/{club_id}/leaders 배열에 추가)
     d. leader_access_requests 문서 업데이트: status = "approved"
   - 거부 시:
     a. leader_access_requests 문서 업데이트: status = "rejected"
     b. 거부 사유 입력 (admin_notes)

[승인 후]
- 사용자는 다음 로그인 시 club-leader 권한 획득
- /admin/dashboard 접근 가능
```

### 2.3 Super Admin 생성 (수동 생성만 가능)
```
[생성 방법]
Option 1: Firebase Console 수동 생성
1. Firebase Console > Authentication에서 사용자 생성
2. Firebase Console > Authentication > 사용자 > Custom Claims에서 {"role": "super-admin"} 설정

Option 2: 백엔드 스크립트 실행
1. backend/scripts/create_superadmin.py 실행
   $ cd backend
   $ python scripts/create_superadmin.py
2. 스크립트가 다음 작업 수행:
   a. Firebase Auth에 계정 생성
   b. Custom Claims 설정: {"role": "super-admin"}
   c. Firestore users 컬렉션에 프로필 생성
      {
        uid: string
        email: string
        display_name: string
        role: "super-admin"
        created_at: timestamp
        updated_at: timestamp
      }

[제약 사항]
- ❌ 웹 UI를 통한 SuperAdmin 회원가입 불가
- ❌ 일반 사용자가 SuperAdmin 권한 요청 불가
- ✅ 기존 SuperAdmin만 새로운 SuperAdmin 생성 가능 (향후 구현)
```

---

## 3. 로그인 플로우

### 3.1 Student 로그인
```
[경로]
/student/login

[입력]
- 이메일
- 비밀번호

[처리]
1. Firebase signInWithEmailAndPassword
2. 백엔드 API 호출: GET /api/auth/me (토큰 검증 및 프로필 조회)
3. 역할 확인:
   - role === "student" → ✅ 진행
   - role !== "student" → ⚠️ 오류 메시지 (다른 역할로 로그인 필요)
4. /student/home으로 리다이렉션

[에러 처리]
- 이메일/비밀번호 불일치: "Invalid email or password"
- 계정 비활성화: "This account has been disabled"
- 역할 불일치: "Please use the Admin login for club leaders"
```

### 3.2 Admin/SuperAdmin 로그인
```
[경로]
/admin/login

[UI 특징]
- 역할 선택 토글: [Club Leader] / [Super Admin]
- 선택한 역할에 따라 플레이스홀더 및 안내 문구 변경

[입력]
- 역할 선택 (club-leader 또는 super-admin)
- 이메일
- 비밀번호

[처리]
1. Firebase signInWithEmailAndPassword
2. 백엔드 API 호출: GET /api/auth/me
3. 역할 확인:
   - 선택한 역할 === "club-leader"
     → role이 "club-leader" 또는 "admin"이면 /admin/dashboard
     → role이 "super-admin"이면 역할 불일치 오류
   - 선택한 역할 === "super-admin"
     → role이 "super-admin"이면 /superadmin/dashboard
     → 그 외는 역할 불일치 오류

[에러 처리]
- 역할 불일치: "You don't have [role] permissions. Please select the correct role or contact an administrator."
- 권한 대기 중: "Your leader access request is pending approval. You'll receive an email once approved."
```

---

## 4. Firestore 데이터 구조

### 4.1 users 컬렉션 (기존)
```typescript
interface User {
  uid: string;                    // Firebase UID (문서 ID)
  email: string;
  display_name: string;
  role: "student" | "club-leader" | "admin" | "super-admin";
  
  // Student 전용 필드
  student_id?: string;            // 학번
  department?: string;            // 전공/학과
  interests?: string[];           // 관심사 태그
  recommendation_preferences?: {
    preferred_categories: string[];
    preferred_activity_types: string[];
    available_time_slots: string[];
    last_updated: timestamp;
    source: "ai-form" | "profile";
  };
  
  // Club Leader 전용 필드
  managed_club_ids?: string[];    // 관리하는 동아리 ID 목록
  leader_position?: string;       // President, Vice President 등
  
  // 공통 필드
  created_at: timestamp;
  updated_at: timestamp;
  is_active: boolean;             // 계정 활성화 여부
}
```

### 4.2 leader_access_requests 컬렉션 (신규 생성)
```typescript
interface LeaderAccessRequest {
  id: string;                     // 문서 ID (자동 생성)
  user_id: string;                // 요청자 UID
  email: string;
  display_name: string;
  
  // 요청 내용
  requested_club_id: string | null;     // 기존 동아리 ID (선택 시)
  requested_club_name: string | null;   // 신규 동아리 이름 (생성 요청 시)
  requested_role: string;               // President, Vice President 등
  reason: string;                       // 요청 사유
  
  // 상태
  status: "pending" | "approved" | "rejected";
  requested_at: timestamp;
  processed_at: timestamp | null;
  processed_by: string | null;          // 처리한 SuperAdmin UID
  admin_notes: string | null;           // 관리자 메모 (거부 사유 등)
  
  // 승인 시 추가 정보
  assigned_club_id?: string;            // 실제로 배정된 동아리 ID
}
```

### 4.3 clubs 컬렉션 - leaders 필드 업데이트
```typescript
interface Club {
  // ... 기존 필드들 ...
  
  leaders: {
    uid: string;              // 사용자 UID (users 문서 참조)
    name: string;
    role: string;             // President, Vice President 등
    email: string;
  }[];
  
  // ... 나머지 필드들 ...
}
```

---

## 5. Firebase Custom Claims 전략

### 5.1 Custom Claims 사용 이유
Firebase ID 토큰에 역할 정보를 포함시켜 클라이언트에서도 역할 확인 가능

### 5.2 설정 방법
```python
# backend/app/services/auth_service.py
from firebase_admin import auth

async def set_user_role(uid: str, role: str) -> bool:
    """사용자 역할을 Firebase Custom Claims와 Firestore에 모두 설정"""
    try:
        # 1. Firebase Custom Claims 설정
        auth.set_custom_user_claims(uid, {"role": role})
        
        # 2. Firestore 프로필 업데이트
        await user_service.update_document(
            "users",
            uid,
            {"role": role}
        )
        
        return True
    except Exception as e:
        print(f"Error setting user role: {e}")
        return False
```

### 5.3 조회 방법
```typescript
// 프론트엔드에서 역할 확인
const user = auth.currentUser;
if (user) {
  const token = await user.getIdTokenResult();
  const role = token.claims.role;  // "student", "club-leader", "super-admin"
}
```

---

## 6. 권한 검증 전략

### 6.1 백엔드 권한 검증 (Layered Approach)

#### Layer 1: Firebase Custom Claims
```python
# backend/app/api/dependencies.py

async def get_current_user(authorization: str = Header(None)) -> dict:
    """토큰 검증 및 사용자 정보 반환"""
    token = extract_bearer_token(authorization)
    decoded = await verify_id_token(token)
    
    # decoded에 custom claims 포함됨
    # decoded['role'] 또는 decoded['custom_claims']['role']
    return decoded
```

#### Layer 2: Firestore 프로필 확인
```python
async def verify_user_role(uid: str, required_role: str) -> bool:
    """Firestore에서 역할 재확인 (이중 검증)"""
    user_profile = await user_service.get_user_profile(uid)
    return user_profile and user_profile.get('role') == required_role
```

#### Layer 3: 엔드포인트별 가드
```python
# 특정 역할만 접근 가능
@router.post("/clubs")
async def create_club(
    club_data: ClubCreate,
    current_user: dict = Depends(require_admin)  # admin 또는 super-admin만
):
    pass

# 리소스 소유권 확인
@router.put("/clubs/{club_id}")
async def update_club(
    club_id: str,
    current_user: dict = Depends(require_club_leader)
):
    # 추가 검증: 이 리더가 해당 동아리를 관리하는지 확인
    club = await club_service.get_club(club_id)
    leader_uids = [l['uid'] for l in club.get('leaders', [])]
    
    if current_user['uid'] not in leader_uids and current_user.get('role') != 'super-admin':
        raise HTTPException(status_code=403, detail="Not authorized for this club")
    
    # ... 업데이트 로직 ...
```

### 6.2 프론트엔드 권한 검증 (UI Level + Route Guard)

#### UI Level: 조건부 렌더링
```tsx
// src/contexts/AuthContext.tsx
export function useAuth() {
  const { user } = useContext(AuthContext);
  
  return {
    user,
    isStudent: user?.role === 'student',
    isClubLeader: user?.role === 'club-leader' || user?.role === 'admin',
    isSuperAdmin: user?.role === 'super-admin',
    hasRole: (role: string) => user?.role === role,
  };
}

// 사용 예시
const { isClubLeader } = useAuth();
{isClubLeader && <button>Edit Club</button>}
```

#### Route Guard: 페이지 접근 제어
```tsx
// src/app/admin/dashboard/layout.tsx
'use client';

export default function AdminLayout({ children }) {
  const { user, isClubLeader, isSuperAdmin } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!user) {
      router.push('/admin/login');
    } else if (!isClubLeader && !isSuperAdmin) {
      router.push('/student/home');
      // 또는 권한 부족 페이지
    }
  }, [user, isClubLeader, isSuperAdmin]);
  
  if (!user || (!isClubLeader && !isSuperAdmin)) {
    return <Loading />;
  }
  
  return <>{children}</>;
}
```

### 6.3 Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 역할 확인 함수
    function getUserRole() {
      return request.auth.token.role;
    }
    
    function isStudent() {
      return getUserRole() == 'student';
    }
    
    function isClubLeader() {
      return getUserRole() in ['club-leader', 'admin'];
    }
    
    function isSuperAdmin() {
      return getUserRole() == 'super-admin';
    }
    
    // Users 컬렉션
    match /users/{userId} {
      // 본인 또는 SuperAdmin만 읽기 가능
      allow read: if request.auth.uid == userId || isSuperAdmin();
      // 본인만 쓰기 가능 (역할 필드는 제외)
      allow update: if request.auth.uid == userId 
                    && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role']);
    }
    
    // Clubs 컬렉션
    match /clubs/{clubId} {
      allow read: if request.auth != null;
      allow write: if isClubLeader() || isSuperAdmin();
    }
    
    // Leader Access Requests 컬렉션
    match /leader_access_requests/{requestId} {
      // 본인 요청 또는 SuperAdmin만 읽기
      allow read: if request.auth.uid == resource.data.user_id || isSuperAdmin();
      // Student만 생성 가능 (본인 요청만)
      allow create: if isStudent() && request.auth.uid == request.resource.data.user_id;
      // SuperAdmin만 상태 변경 가능
      allow update: if isSuperAdmin();
    }
  }
}
```

---

## 7. 역할 전환 시나리오

### 7.1 Student → Club Leader
```
1. Student가 /admin/request-access에서 리더 권한 요청
2. leader_access_requests 문서 생성 (status: "pending")
3. SuperAdmin이 /superadmin/club-leaders에서 요청 확인
4. SuperAdmin이 승인:
   a. set_user_role(uid, "club-leader") 호출
   b. Firebase Custom Claims 업데이트
   c. Firestore users/{uid}.role = "club-leader"
   d. clubs/{club_id}.leaders 배열에 추가
   e. leader_access_requests 문서 업데이트 (status: "approved")
5. 사용자는 다음 로그인 시 club-leader로 접근 가능
   (또는 토큰 강제 갱신 API 제공)
```

### 7.2 Club Leader → Student (권한 회수)
```
SuperAdmin이 /superadmin/club-leaders에서:
1. 리더 선택 → "Remove Leader" 클릭
2. 확인 모달 표시
3. 승인 시:
   a. set_user_role(uid, "student") 호출
   b. Firebase Custom Claims 업데이트
   c. Firestore users/{uid}.role = "student"
   d. clubs/{club_id}.leaders 배열에서 제거
   e. managed_club_ids 초기화
4. 사용자는 다음 로그인 시 student로만 접근 가능
```

---

## 8. 보안 고려사항

### 8.1 토큰 관리
- Firebase ID 토큰은 1시간마다 자동 갱신
- 역할 변경 시 즉시 반영하려면 강제 토큰 갱신 필요
```typescript
// 역할 변경 후 토큰 강제 갱신
await user.getIdToken(true);  // forceRefresh = true
```

### 8.2 이중 검증
- 클라이언트 역할 확인: UX 개선 (불필요한 API 호출 방지)
- 서버 역할 확인: 보안 (실제 권한 검증)
- Firestore Rules: 백업 보안 계층

### 8.3 역할 변조 방지
- Custom Claims는 클라이언트에서 변경 불가
- Firestore users.role 필드는 Security Rules로 보호
- 백엔드 API만 역할 변경 가능 (SuperAdmin 권한 필요)

---

## 9. 향후 확장 고려사항

### 9.1 세분화된 권한 (향후)
현재는 역할 기반 (RBAC), 향후 권한 기반 (PBAC)으로 확장 가능
```typescript
interface User {
  role: string;
  permissions?: string[];  // ["clubs.create", "events.edit", ...]
}
```

### 9.2 다중 동아리 리더
한 사용자가 여러 동아리의 리더일 수 있음
```typescript
interface User {
  managed_club_ids: string[];  // 이미 설계에 포함됨
}
```

### 9.3 임시 권한
특정 기간만 리더 권한 부여 (학기별 갱신 등)
```typescript
interface User {
  role_expires_at?: timestamp;
}
```

---

## 10. 구현 체크리스트

1단계 완료 후 다음 작업:

### 백엔드
- [ ] `backend/app/models/auth.py` 생성 (요청/응답 모델)
- [ ] `backend/app/api/auth.py` 생성 (회원가입 API)
- [ ] `backend/app/api/admin/leader_requests.py` 생성 (리더 요청 관리)
- [ ] `backend/app/services/auth_service.py` 확장 (역할 할당 로직)
- [ ] `backend/scripts/create_superadmin.py` 생성

### 프론트엔드
- [ ] `src/contexts/AuthContext.tsx` 생성
- [ ] `src/lib/api/auth.ts` 생성
- [ ] `src/components/ProtectedRoute.tsx` 생성
- [ ] 로그인 폼 Firebase 연동
- [ ] 회원가입 폼 Firebase 연동
- [ ] `src/app/admin/request-access/page.tsx` 생성
- [ ] 레이아웃 가드 구현

### Firestore
- [ ] `leader_access_requests` 컬렉션 색인 생성
- [ ] Security Rules 업데이트

### 테스트
- [ ] SuperAdmin 계정 1개 생성
- [ ] Student 회원가입 테스트
- [ ] Leader 권한 요청 테스트
- [ ] 역할별 접근 제어 테스트

---

---

## 11. 확정된 정책 결정사항

### 11.1 이메일 도메인 제한
**결정**: 모든 이메일 도메인 허용
- 학생, 리더 모두 제한 없음
- 테스트 및 개발 용이성 고려

### 11.2 리더 권한 요청 UI
**결정**: 기존 UI 스타일 재사용
- `/admin/request-access` 페이지 생성 (AdminLoginForm에 이미 링크 존재)
- 기존 로그인/회원가입 폼 스타일 활용
- SuperAdmin 관리: `/superadmin/club-leaders` 페이지에 "Pending Requests" 탭 추가

### 11.3 초기 SuperAdmin 계정
**확정 정보**:
```
이메일: superadmin@gmail.com
비밀번호: Super123
이름: superadmin
```
(Firebase 최소 6자 요구사항에 맞춰 변경)

### 11.4 비밀번호 정책
**결정**: 강화 정책
- 최소 8자 이상
- 대문자 1개 이상
- 소문자 1개 이상
- 숫자 1개 이상
- 정규식: `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$`

### 11.5 역할 명칭
**확정**:
- `admin` = `club-leader` (완전 동의어)
- `super-admin`: 최상위 권한 (별도 역할)
- 백엔드/프론트엔드 모두 `club-leader`로 통일 사용
- `admin`은 레거시 호환성을 위해 동일하게 처리

---

## 12. 구현 완료 상태

### 12.1 완료된 단계 ✅
- ✅ **1단계**: 백엔드 인증 API 구현 완료
  - 학생 회원가입, 리더 권한 요청, 사용자 조회 API
  - SuperAdmin 권한 요청 관리 API
- ✅ **2단계**: 역할 기반 접근 제어 (RBAC) 완료
  - Firebase Custom Claims
  - Firestore 역할 동기화
  - 백엔드 의존성 함수 (`require_super_admin`, `require_club_leader`)
  - 프론트엔드 `ProtectedRoute` 컴포넌트
- ✅ **3단계**: 프론트엔드 인증 로직 구현 완료
  - 학생/Admin/SuperAdmin 로그인 페이지
  - 학생 회원가입 페이지
  - 리더 권한 요청 페이지
  - 역할별 자동 리다이렉트
  - `AuthContext` 전역 상태 관리
- ✅ **4단계**: SuperAdmin 권한 요청 관리 UI 완료
  - `/superadmin/club-leaders` 페이지에 "Pending Requests" 탭 추가
  - 승인/거부 모달 구현
  - 실시간 API 연동
- ✅ **5단계**: 로그아웃 기능 완료
  - Student/Admin/SuperAdmin 헤더에 로그아웃 추가
  - 역할별 로그인 페이지로 리다이렉트
- ✅ **7단계**: 프로필 편집 기능 완료
  - 공통 `EditProfileModal` 컴포넌트
  - Student/Admin/SuperAdmin 통합

### 12.2 보류/미구현 단계 ⏸️
- ⏸️ **6단계**: 비밀번호 재설정 (Forgot Password)
  - Firebase Password Reset Email 사용 예정
  - 구현 예정 위치: `src/app/student/login/components/ForgotPasswordModal.tsx`

### 12.3 테스트 완료 항목
- ✅ SuperAdmin 계정 생성 (`superadmin@gmail.com` / `Super123`)
- ✅ SuperAdmin 로그인 및 대시보드 접근
- ✅ 역할 기반 접근 제어 검증
- ✅ 로그아웃 기능 동작 확인
- ✅ 프로필 편집 및 실시간 반영 확인

### 12.4 생성된 주요 파일
**백엔드**:
- `backend/app/api/auth.py` - 인증 API
- `backend/app/api/admin/leader_requests.py` - SuperAdmin 리더 요청 관리
- `backend/app/models/auth.py` - 인증 관련 Pydantic 모델
- `backend/scripts/create_superadmin.py` - 초기 SuperAdmin 생성 스크립트
- `backend/app/services/auth_service.py` - 인증 서비스 로직

**프론트엔드**:
- `src/contexts/AuthContext.tsx` - 전역 인증 컨텍스트
- `src/components/ProtectedRoute.tsx` - 라우트 보호 컴포넌트
- `src/components/EditProfileModal.tsx` - 프로필 편집 모달
- `src/lib/api/auth.ts` - 인증 API 클라이언트
- `src/lib/api/admin.ts` - SuperAdmin API 클라이언트
- `src/lib/api/users.ts` - 사용자 API 클라이언트
- `src/lib/api/clubs.ts` - 동아리 API 클라이언트
- `src/app/admin/request-access/page.tsx` - 리더 권한 요청 페이지
- `src/app/superadmin/club-leaders/components/PendingRequestsTable.tsx` - 대기 요청 테이블
- `src/app/superadmin/club-leaders/components/ApproveRequestModal.tsx` - 승인 모달
- `src/app/superadmin/club-leaders/components/RejectRequestModal.tsx` - 거부 모달

### 12.5 다음 구현 예정 기능
1. **비밀번호 재설정** (6단계)
2. **더미 데이터 Firestore 마이그레이션**
3. **Admin Dashboard 실제 데이터 연동**
4. **이벤트 관리 시스템**
5. **구독 시스템**
6. **AI 추천 시스템 프론트엔드 연동**

자세한 구현 상태는 [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) 참조.

---

## 문서 버전
- v1.0 - 2026-01-31: 초안 작성
- v1.1 - 2026-01-31: 정책 결정사항 확정
- v1.2 - 2026-01-31: 구현 완료 상태 추가
