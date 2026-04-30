# ClubAtlas Icon Reference Guide

이 문서는 프로젝트에서 사용하는 모든 아이콘의 위치와 용도를 정리합니다.

## 📁 아이콘 폴더 구조

```
public/images/icons/
├── logo.svg              # 공용 로고 (헤더, 내비게이션 등)
├── bell.svg              # 공용 알림 아이콘
├── profile.svg           # 공용 프로필/유저 아이콘
├── search.svg            # 검색 아이콘
├── arrow-right.svg       # 화살표 (버튼, 네비게이션)
├── sparkles.svg          # AI/특별 기능 표시
├── clock.svg             # 시간/일정 표시 (클럽 일정)
├── users.svg             # 회원 수 표시
├── ai/                   # AI Recommendations 페이지 전용
│   ├── logo.svg          # AI 페이지용 로고 (다른 디자인)
│   ├── ai-avatar.svg     # AI 어시스턴트 아바타
│   ├── assistant.svg     # AI 어시스턴트 아이콘
│   ├── star.svg          # AI 추천 배너 메인 아이콘
│   ├── target.svg        # 맞춤형 매칭 아이콘
│   ├── clock.svg         # 스케줄 관련 아이콘 (다른 디자인)
│   └── bolt.svg          # 즉시 결과 아이콘
├── calendar/             # Calendar 페이지 전용
│   ├── view-mode.svg     # View Mode 아이콘
│   ├── month-view.svg    # Month View 아이콘
│   ├── week-view.svg     # Week View 아이콘
│   ├── create.svg        # Create 버튼 아이콘
│   ├── arrow-left.svg    # 이전 달 화살표
│   ├── arrow-right.svg   # 다음 달 화살표
│   ├── upcoming.svg      # Upcoming 섹션 아이콘
│   ├── export.svg        # Export 버튼 아이콘
│   ├── close.svg         # 닫기 버튼 (모달)
│   ├── calendar-date.svg # 날짜 선택 아이콘
│   ├── location.svg      # 위치 아이콘 (CreateEventModal)
│   ├── location2.svg     # 위치 아이콘 (EventDetailModal, 다른 디자인)
│   ├── clock.svg         # 시간 아이콘
│   ├── users.svg         # 참석자 아이콘
│   ├── attendance.svg    # 출석 체크 아이콘
│   └── bell.svg          # 알림 구독 아이콘
├── club-detail/          # Club Detail 페이지 전용
│   ├── back-arrow.svg    # 뒤로가기 화살표
│   ├── users.svg         # 회원 수 아이콘
│   ├── calendar-badge.svg # 설립 연도 아이콘
│   ├── share.svg         # 공유 버튼
│   ├── subscribe.svg     # 구독 버튼
│   ├── email-small.svg   # 이메일 아이콘 (리더십 팀)
│   ├── calendar.svg      # 정기 일정 아이콘
│   ├── arrow-right.svg   # 화살표 (View on Calendar)
│   ├── location.svg      # 위치 아이콘
│   ├── map.svg           # 캠퍼스 맵 아이콘
│   ├── attendees.svg     # 참석자 아이콘
│   ├── users-red.svg     # 회원 아이콘 (Quick Info - 빨간색)
│   ├── clock-blue.svg    # 시계 아이콘 (Quick Info - 파란색)
│   ├── contact-green.svg # 연락처 아이콘 (Quick Info - 녹색)
│   ├── bell.svg          # 알림 아이콘
│   └── email.svg         # 이메일 아이콘 (Subscribe)
├── clubs/                # Browse Clubs 페이지 전용
│   ├── search.svg        # 검색 아이콘
│   ├── filter.svg        # 필터 아이콘
│   ├── clock.svg         # 시간/일정 아이콘
│   ├── location.svg      # 위치 아이콘
│   ├── users.svg         # 회원 수 아이콘
│   ├── heart.svg         # 즐겨찾기 아이콘
│   └── share.svg         # 공유 아이콘
├── student-login/        # Student Login 페이지 전용
│   ├── student-portal.svg # Student Portal 아이콘
│   └── arrow.svg         # Sign In 버튼 화살표
└── welcome/              # Welcome 페이지 전용
    ├── logo.svg          # Welcome 페이지 로고
    ├── student-icon.svg  # Student Access 아이콘
    ├── admin-icon.svg    # Admin Access 아이콘
    ├── arrow.svg         # Access Card 버튼 화살표
    ├── club-discovery.svg     # Club Discovery 아이콘
    ├── calendar.svg      # Event Calendar 아이콘
    └── ai-recommendations.svg # AI Recommendations 아이콘
```

---

## 🔄 공용 아이콘 (여러 페이지에서 재사용)

### 1. **logo.svg** - 로고
- **경로**: `/images/icons/logo.svg`
- **사용 위치**:
  - `/student/home` - Header 컴포넌트 (좌측 상단)
  - 모든 Student 페이지의 헤더에서 재사용 가능
- **크기**: 24x24px (헤더 기준)
- **색상**: Figma 디자인에 따름
- **컴포넌트**: `src/app/student/home/components/Header.tsx`

### 2. **bell.svg** - 알림
- **경로**: `/images/icons/bell.svg`
- **사용 위치**:
  - `/student/home` - Header 컴포넌트 (우측 상단 액션 바)
  - `/student/home/ai-recommendations` - Header
  - 모든 Student 페이지의 알림 버튼
- **크기**: 24x24px
- **특징**: 알림 dot과 함께 사용
- **컴포넌트**: 
  - `src/app/student/home/components/Header.tsx`
  - `src/app/student/home/ai-recommendations/page.tsx`

### 3. **profile.svg** - 프로필/유저
- **경로**: `/images/icons/profile.svg`
- **사용 위치**:
  - `/student/home` - Header 컴포넌트 (우측 상단 프로필 버튼)
  - `/student/home/ai-recommendations` - Header
  - 모든 Student 페이지의 프로필 버튼
- **크기**: 32x32px (프로필 버튼)
- **컴포넌트**: 
  - `src/app/student/home/components/Header.tsx`
  - `src/app/student/home/ai-recommendations/page.tsx`

### 4. **search.svg** - 검색
- **경로**: `/images/icons/search.svg`
- **사용 위치**:
  - `/student/home` - Header 컴포넌트 (우측 상단 액션 바)
  - 검색 기능이 있는 모든 페이지
- **크기**: 24x24px
- **컴포넌트**: `src/app/student/home/components/Header.tsx`

### 5. **arrow-right.svg** - 화살표
- **경로**: `/images/icons/arrow-right.svg`
- **사용 위치**:
  - `/student/home` - HeroSection (Explore Clubs 버튼)
  - `/student/home` - FeaturedClubs (View All 버튼)
  - 모든 "더보기", "이동" 버튼
- **크기**: 20x20px
- **컴포넌트**: 
  - `src/app/student/home/components/HeroSection.tsx`
  - `src/app/student/home/components/FeaturedClubs.tsx`

### 6. **sparkles.svg** - AI/특별 기능
- **경로**: `/images/icons/sparkles.svg`
- **사용 위치**:
  - `/student/home` - HeroSection (Get AI Recommendations 버튼)
  - AI 관련 기능 표시
- **크기**: 20x20px
- **컴포넌트**: `src/app/student/home/components/HeroSection.tsx`

### 7. **clock.svg** - 시간/일정
- **경로**: `/images/icons/clock.svg`
- **사용 위치**:
  - `/student/home` - ClubCard (클럽 일정 표시)
  - 일정 관련 메타데이터
- **크기**: 16x16px
- **색상**: rgba(255, 255, 255, 0.8)
- **컴포넌트**: `src/app/student/home/components/ClubCard.tsx`

### 8. **users.svg** - 회원 수
- **경로**: `/images/icons/users.svg`
- **사용 위치**:
  - `/student/home` - ClubCard (회원 수 표시)
  - 멤버십 관련 메타데이터
- **크기**: 16x16px
- **색상**: rgba(255, 255, 255, 0.8)
- **컴포넌트**: `src/app/student/home/components/ClubCard.tsx`

---

## 🎯 페이지별 전용 아이콘

### Student Login Page (`/student/login`)

#### 16. **student-login/student-portal.svg** - Student Portal 아이콘
- **경로**: `/images/icons/student-login/student-portal.svg`
- **사용 위치**: InfoPanel (좌측 패널 메인 아이콘)
- **크기**: 64x64px
- **컴포넌트**: `src/app/student/login/components/InfoPanel.tsx` (line 12)

#### 17. **student-login/arrow.svg** - Sign In 버튼 화살표
- **경로**: `/images/icons/student-login/arrow.svg`
- **사용 위치**: LoginForm - Sign In 버튼
- **크기**: 20x20px
- **컴포넌트**: `src/app/student/login/components/LoginForm.tsx` (line 71)

### Welcome Page (`/welcome`)

#### 18. **welcome/logo.svg** - 메인 로고
- **경로**: `/images/icons/welcome/logo.svg`
- **사용 위치**: Logo 컴포넌트 (상단 중앙)
- **크기**: 48x48px
- **컴포넌트**: `src/app/welcome/components/Logo.tsx`

#### 19. **welcome/student-icon.svg** - Student Access 아이콘
- **경로**: `/images/icons/welcome/student-icon.svg`
- **사용 위치**: Student Access Card
- **크기**: 48x48px
- **컴포넌트**: `src/app/welcome/page.tsx` (line 28)

#### 20. **welcome/admin-icon.svg** - Admin Access 아이콘
- **경로**: `/images/icons/welcome/admin-icon.svg`
- **사용 위치**: Admin Access Card
- **크기**: 48x48px
- **컴포넌트**: `src/app/welcome/page.tsx` (line 36)

#### 21. **welcome/arrow.svg** - 버튼 화살표
- **경로**: `/images/icons/welcome/arrow.svg`
- **사용 위치**: Access Card 버튼
- **크기**: 20x20px
- **컴포넌트**: `src/app/welcome/components/AccessCard.tsx`

#### 22. **welcome/club-discovery.svg** - Club Discovery 아이콘
- **경로**: `/images/icons/welcome/club-discovery.svg`
- **사용 위치**: Platform Features - Club Discovery
- **크기**: 32x32px
- **컴포넌트**: `src/app/welcome/page.tsx` (line 51)

#### 23. **welcome/calendar.svg** - Event Calendar 아이콘
- **경로**: `/images/icons/welcome/calendar.svg`
- **사용 위치**: Platform Features - Event Calendar
- **크기**: 32x32px
- **컴포넌트**: `src/app/welcome/page.tsx` (line 56)

#### 24. **welcome/ai-recommendations.svg** - AI Recommendations 아이콘
- **경로**: `/images/icons/welcome/ai-recommendations.svg`
- **사용 위치**: Platform Features - AI Recommendations
- **크기**: 32x32px
- **컴포넌트**: `src/app/welcome/page.tsx` (line 61)

### AI Recommendations Page (`/student/home/ai-recommendations`)

#### 9. **ai/logo.svg** - AI 페이지용 로고
- **경로**: `/images/icons/ai/logo.svg`
- **사용 위치**: AI Recommendations 페이지 헤더
- **주의**: 공용 `logo.svg`와 **다른 디자인**
- **Figma UUID**: `different-design`

#### 10. **ai/star.svg** - AI 배너 메인 아이콘
- **경로**: `/images/icons/ai/star.svg`
- **사용 위치**: AI Recommendations 배너 (aiIconLarge)
- **크기**: 40x40px
- **역할**: AI 기능 강조
- **컴포넌트**: `src/app/student/home/ai-recommendations/page.tsx` (line 203)

#### 11. **ai/target.svg** - 맞춤형 매칭
- **경로**: `/images/icons/ai/target.svg`
- **사용 위치**: Features Grid - "Personalized Matches"
- **크기**: 24x24px
- **컴포넌트**: `src/app/student/home/ai-recommendations/page.tsx` (line 214)

#### 12. **ai/clock.svg** - 스케줄 친화
- **경로**: `/images/icons/ai/clock.svg`
- **사용 위치**: Features Grid - "Schedule-Friendly"
- **크기**: 24x24px
- **주의**: 공용 `clock.svg`와 **다른 디자인**
- **컴포넌트**: `src/app/student/home/ai-recommendations/page.tsx` (line 222)

#### 13. **ai/bolt.svg** - 즉시 결과
- **경로**: `/images/icons/ai/bolt.svg`
- **사용 위치**: Features Grid - "Instant Results"
- **크기**: 24x24px
- **컴포넌트**: `src/app/student/home/ai-recommendations/page.tsx` (line 230)

#### 14. **ai/assistant.svg** - AI 어시스턴트 표시
- **경로**: `/images/icons/ai/assistant.svg`
- **사용 위치**: Chat Header - Assistant Info
- **크기**: 32x32px
- **역할**: 채팅 헤더의 어시스턴트 정보
- **컴포넌트**: `src/app/student/home/ai-recommendations/page.tsx` (line 245)

#### 15. **ai/ai-avatar.svg** - AI 아바타
- **경로**: `/images/icons/ai/ai-avatar.svg`
- **사용 위치**: Chat Messages - AI 메시지 옆 아바타
- **크기**: 40x40px
- **역할**: AI의 채팅 메시지 식별자
- **컴포넌트**: `src/app/student/home/ai-recommendations/page.tsx` (line 262, 287)

---

## 📋 재사용 가이드

### 새 페이지 개발 시 체크리스트

1. **헤더/네비게이션**
   - ✅ Logo: `/images/icons/logo.svg`
   - ✅ Notifications: `/images/icons/bell.svg`
   - ✅ Profile: `/images/icons/profile.svg`
   - ✅ Search: `/images/icons/search.svg`

2. **버튼/CTA**
   - ✅ Arrow (Next/More): `/images/icons/arrow-right.svg`
   - ✅ AI Features: `/images/icons/sparkles.svg`

3. **메타데이터 표시**
   - ✅ Time/Schedule: `/images/icons/clock.svg`
   - ✅ Members/Users: `/images/icons/users.svg`

4. **새 아이콘 필요 시**
   - Figma에서 해당 페이지의 아이콘 UUID 확인
   - 기존 아이콘과 UUID 비교
   - 다른 UUID = 다른 디자인 → 새 파일 필요
   - 페이지 전용인 경우: `/images/icons/[page-name]/` 폴더 생성
   - 여러 페이지 공용인 경우: `/images/icons/` 에 저장

---

## ⚠️ 주의사항

### 아이콘 이름이 같아도 디자인이 다를 수 있음!

- **예시**: `logo.svg`
  - 공용: `/images/icons/logo.svg`
  - AI 페이지: `/images/icons/ai/logo.svg` ← **다른 디자인**

- **예시**: `clock.svg`
  - 공용 (클럽 카드용): `/images/icons/clock.svg`
  - AI 페이지 (Features Grid): `/images/icons/ai/clock.svg` ← **다른 디자인**

### 확인 방법
1. Figma URL의 UUID 비교
2. UUID가 다르면 = 다른 디자인
3. 색상 조정이 필요한 경우 CSS filter 또는 SVG 수정

---

## 🎯 페이지별 전용 아이콘

### Browse Clubs Page (`/student/home/clubs`)

#### 25. **clubs/search.svg** - 검색 아이콘
- **경로**: `/images/icons/clubs/search.svg`
- **사용 위치**: 
  - 메인 검색바 (page.tsx)
  - SearchBar 컴포넌트
- **크기**: 20x20px
- **컴포넌트**: 
  - `src/app/student/home/clubs/page.tsx` (line 8)
  - `src/app/student/home/clubs/components/SearchBar.tsx` (line 5)

#### 26. **clubs/filter.svg** - 필터 아이콘
- **경로**: `/images/icons/clubs/filter.svg`
- **사용 위치**: 필터 버튼
- **크기**: 20x20px
- **컴포넌트**: 
  - `src/app/student/home/clubs/page.tsx` (line 9)
  - `src/app/student/home/clubs/components/SearchBar.tsx` (line 6)

#### 27. **clubs/clock.svg** - 시간/일정
- **경로**: `/images/icons/clubs/clock.svg`
- **사용 위치**: 클럽 카드 메타 정보 (미팅 시간)
- **크기**: 16x16px
- **컴포넌트**: 
  - `src/app/student/home/clubs/page.tsx` (line 11)
  - `src/app/student/home/clubs/components/ClubCard.tsx` (line 6)
  - `src/app/student/home/clubs/[id]/components/AboutSection.tsx` (line 5)
  - `src/app/student/home/clubs/[id]/components/EventsSection.tsx` (line 5)

#### 28. **clubs/location.svg** - 위치 정보
- **경로**: `/images/icons/clubs/location.svg`
- **사용 위치**: 클럽 카드 메타 정보 (미팅 장소)
- **크기**: 16x16px
- **컴포넌트**: 
  - `src/app/student/home/clubs/page.tsx` (line 12)
  - `src/app/student/home/clubs/components/ClubCard.tsx` (line 7)
  - `src/app/student/home/clubs/[id]/components/AboutSection.tsx` (line 6)
  - `src/app/student/home/clubs/[id]/components/EventsSection.tsx` (line 6)

#### 29. **clubs/users.svg** - 회원 수
- **경로**: `/images/icons/clubs/users.svg`
- **사용 위치**: 클럽 카드 메타 정보 (회원 수)
- **크기**: 16x16px
- **주의**: users-1, users-2 모두 같은 파일 사용
- **컴포넌트**: 
  - `src/app/student/home/clubs/page.tsx` (line 13-14)
  - `src/app/student/home/clubs/components/ClubCard.tsx` (line 8)

#### 30. **clubs/heart.svg** - 즐겨찾기
- **경로**: `/images/icons/clubs/heart.svg`
- **사용 위치**: 즐겨찾기 버튼
- **크기**: 20x20px
- **컴포넌트**: 
  - `src/app/student/home/clubs/page.tsx` (line 10)
  - `src/app/student/home/clubs/components/ClubCard.tsx` (line 9)
  - `src/app/student/home/clubs/[id]/components/HeroSection.tsx` (line 6)

#### 31. **clubs/share.svg** - 공유 버튼
- **경로**: `/images/icons/clubs/share.svg`
- **사용 위치**: 공유 버튼
- **크기**: 20x20px
- **주의**: heart.svg와 같은 모양으로 저장됨
- **컴포넌트**: `src/app/student/home/clubs/page.tsx` (line 15)

#### ⚠️ **chevron.svg** - 드롭다운 화살표 (미저장)
- **상태**: 저장하지 못함 → **CSS로 대체**
- **구현**: `FilterSection.module.css`의 `::after` 가상 요소로 삼각형 화살표 구현
- **컴포넌트**: `src/app/student/home/clubs/components/FilterSection.tsx`

---

## 🎯 페이지별 전용 아이콘

### Club Detail Page (`/student/home/clubs/[id]`)

#### 48. **club-detail/back-arrow.svg** - 뒤로가기 화살표
- **경로**: `/images/icons/club-detail/back-arrow.svg`
- **사용 위치**: 헤더 - Back to Browse 버튼
- **크기**: 16x16px
- **컴포넌트**: `src/app/student/home/clubs/[id]/page.tsx` (line 23)

#### 49. **club-detail/users.svg** - 회원 수 아이콘
- **경로**: `/images/icons/club-detail/users.svg`
- **사용 위치**: Hero 섹션 - Quick Meta (회원 수)
- **크기**: 20x20px
- **컴포넌트**: `src/app/student/home/clubs/[id]/page.tsx` (line 57)

#### 50. **club-detail/calendar-badge.svg** - 설립 연도 아이콘
- **경로**: `/images/icons/club-detail/calendar-badge.svg`
- **사용 위치**: Hero 섹션 - Quick Meta (설립 연도)
- **크기**: 20x20px
- **컴포넌트**: `src/app/student/home/clubs/[id]/page.tsx` (line 64)

#### 51. **club-detail/share.svg** - 공유 버튼
- **경로**: `/images/icons/club-detail/share.svg`
- **사용 위치**: Hero 섹션 - Share 버튼
- **크기**: 20x20px
- **컴포넌트**: `src/app/student/home/clubs/[id]/page.tsx` (line 74)

#### 52. **club-detail/subscribe.svg** - 구독 버튼
- **경로**: `/images/icons/club-detail/subscribe.svg`
- **사용 위치**: Hero 섹션 - Subscribe 버튼
- **크기**: 20x20px
- **컴포넌트**: `src/app/student/home/clubs/[id]/page.tsx` (line 79)

#### 53. **club-detail/email-small.svg** - 이메일 아이콘 (리더십 팀)
- **경로**: `/images/icons/club-detail/email-small.svg`
- **사용 위치**: Leadership Team - 이메일 표시
- **크기**: 12x12px
- **컴포넌트**: `src/app/student/home/clubs/[id]/page.tsx` (line 130)

#### 54. **club-detail/calendar.svg** - 정기 일정 아이콘
- **경로**: `/images/icons/club-detail/calendar.svg`
- **사용 위치**: Meeting Information - Regular Schedule 카드
- **크기**: 20x20px
- **컴포넌트**: `src/app/student/home/clubs/[id]/page.tsx` (line 151)

#### 55. **club-detail/arrow-right.svg** - 화살표 (View on Calendar)
- **경로**: `/images/icons/club-detail/arrow-right.svg`
- **사용 위치**: Meeting Information - View on Calendar 버튼
- **크기**: 16x16px
- **컴포넌트**: `src/app/student/home/clubs/[id]/page.tsx` (line 171)

#### 56. **club-detail/location.svg** - 위치 아이콘
- **경로**: `/images/icons/club-detail/location.svg`
- **사용 위치**: Meeting Information - Meeting Location 카드
- **크기**: 20x20px
- **컴포넌트**: `src/app/student/home/clubs/[id]/page.tsx` (line 180)

#### 57. **club-detail/map.svg** - 캠퍼스 맵 아이콘
- **경로**: `/images/icons/club-detail/map.svg`
- **사용 위치**: Meeting Information - View on Campus Map 버튼
- **크기**: 16x16px
- **컴포넌트**: `src/app/student/home/clubs/[id]/page.tsx` (line 200)

#### 58. **club-detail/attendees.svg** - 참석자 아이콘
- **경로**: `/images/icons/club-detail/attendees.svg`
- **사용 위치**: Past Activities - 참석자 수 표시
- **크기**: 16x16px
- **컴포넌트**: `src/app/student/home/clubs/[id]/page.tsx` (line 228)

#### 59. **club-detail/users-red.svg** - 회원 아이콘 (Quick Info)
- **경로**: `/images/icons/club-detail/users-red.svg`
- **사용 위치**: Sidebar - Quick Info (회원 수)
- **크기**: 20x20px
- **주의**: Hero 섹션의 users.svg와 **다른 디자인**
- **컴포넌트**: `src/app/student/home/clubs/[id]/page.tsx` (line 266)

#### 60. **club-detail/clock-blue.svg** - 시계 아이콘 (Quick Info)
- **경로**: `/images/icons/club-detail/clock-blue.svg`
- **사용 위치**: Sidebar - Quick Info (설립 연도)
- **크기**: 20x20px
- **컴포넌트**: `src/app/student/home/clubs/[id]/page.tsx` (line 277)

#### 61. **club-detail/contact-green.svg** - 연락처 아이콘 (Quick Info)
- **경로**: `/images/icons/club-detail/contact-green.svg`
- **사용 위치**: Sidebar - Quick Info (연락처)
- **크기**: 20x20px
- **컴포넌트**: `src/app/student/home/clubs/[id]/page.tsx` (line 288)

#### 62. **club-detail/bell.svg** - 알림 아이콘
- **경로**: `/images/icons/club-detail/bell.svg`
- **사용 위치**: Sidebar - Get Updates 헤더
- **크기**: 20x20px
- **컴포넌트**: `src/app/student/home/clubs/[id]/page.tsx` (line 304)

#### 63. **club-detail/email.svg** - 이메일 아이콘 (Subscribe)
- **경로**: `/images/icons/club-detail/email.svg`
- **사용 위치**: Sidebar - Subscribe to Updates 버튼
- **크기**: 16x16px
- **컴포넌트**: `src/app/student/home/clubs/[id]/page.tsx` (line 321)

---

### Calendar Page (`/student/home/calendar`)

#### 32. **calendar/view-mode.svg** - View Mode 아이콘
- **경로**: `/images/icons/calendar/view-mode.svg`
- **사용 위치**: 좌측 사이드바 - View Mode 카드 헤더
- **크기**: 20x20px
- **컴포넌트**: `src/app/student/home/calendar/page.tsx` (line 11)

#### 33. **calendar/month-view.svg** - Month View 아이콘
- **경로**: `/images/icons/calendar/month-view.svg`
- **사용 위치**: Month View 버튼
- **크기**: 16x16px
- **컴포넌트**: `src/app/student/home/calendar/page.tsx` (line 12)

#### 34. **calendar/week-view.svg** - Week View 아이콘
- **경로**: `/images/icons/calendar/week-view.svg`
- **사용 위치**: Week View 버튼
- **크기**: 16x16px
- **컴포넌트**: `src/app/student/home/calendar/page.tsx` (line 13)

#### 35. **calendar/create.svg** - Create 버튼 아이콘
- **경로**: `/images/icons/calendar/create.svg`
- **사용 위치**: 
  - Create 버튼
  - CreateEventModal 헤더 아이콘
- **크기**: 20x20px, 24x24px
- **컴포넌트**: 
  - `src/app/student/home/calendar/page.tsx` (line 14)
  - `src/app/student/home/calendar/components/CreateEventModal.tsx` (line 8)

#### 36. **calendar/arrow-left.svg** - 이전 달 화살표
- **경로**: `/images/icons/calendar/arrow-left.svg`
- **사용 위치**: 월 네비게이션 (이전 버튼)
- **크기**: 24x24px
- **컴포넌트**: `src/app/student/home/calendar/page.tsx` (line 15)

#### 37. **calendar/arrow-right.svg** - 다음 달 화살표
- **경로**: `/images/icons/calendar/arrow-right.svg`
- **사용 위치**: 월 네비게이션 (다음 버튼)
- **크기**: 24x24px
- **컴포넌트**: `src/app/student/home/calendar/page.tsx` (line 16)

#### 38. **calendar/upcoming.svg** - Upcoming 섹션 아이콘
- **경로**: `/images/icons/calendar/upcoming.svg`
- **사용 위치**: "Upcoming This Week" 섹션 헤더
- **크기**: 24x24px
- **컴포넌트**: `src/app/student/home/calendar/page.tsx` (line 17)

#### 39. **calendar/export.svg** - Export 버튼 아이콘
- **경로**: `/images/icons/calendar/export.svg`
- **사용 위치**: Export Calendar 버튼
- **크기**: 20x20px
- **컴포넌트**: `src/app/student/home/calendar/page.tsx` (line 18)

#### 40. **calendar/close.svg** - 닫기 버튼
- **경로**: `/images/icons/calendar/close.svg`
- **사용 위치**: 
  - CreateEventModal 닫기 버튼
  - EventDetailModal 닫기 버튼
- **크기**: 20x20px
- **컴포넌트**: 
  - `src/app/student/home/calendar/components/CreateEventModal.tsx` (line 9)
  - `src/app/student/home/calendar/components/EventDetailModal.tsx` (line 6)

#### 41. **calendar/calendar-date.svg** - 날짜 선택 아이콘
- **경로**: `/images/icons/calendar/calendar-date.svg`
- **사용 위치**: CreateEventModal - Date input 아이콘
- **크기**: 16x16px
- **컴포넌트**: `src/app/student/home/calendar/components/CreateEventModal.tsx` (line 10)

#### 42. **calendar/location.svg** - 위치 아이콘 (CreateEventModal)
- **경로**: `/images/icons/calendar/location.svg`
- **사용 위치**: CreateEventModal - Location input 아이콘
- **크기**: 20x20px
- **컴포넌트**: `src/app/student/home/calendar/components/CreateEventModal.tsx` (line 11)

#### 43. **calendar/location2.svg** - 위치 아이콘 (EventDetailModal)
- **경로**: `/images/icons/calendar/location2.svg`
- **사용 위치**: EventDetailModal - Location 정보 아이콘
- **크기**: 20x20px
- **주의**: CreateEventModal의 location.svg와 **다른 디자인**
- **컴포넌트**: `src/app/student/home/calendar/components/EventDetailModal.tsx` (line 8)

#### 44. **calendar/clock.svg** - 시간 아이콘
- **경로**: `/images/icons/calendar/clock.svg`
- **사용 위치**: EventDetailModal - Time 정보 아이콘
- **크기**: 20x20px
- **컴포넌트**: `src/app/student/home/calendar/components/EventDetailModal.tsx` (line 7)

#### 45. **calendar/users.svg** - 참석자 아이콘
- **경로**: `/images/icons/calendar/users.svg`
- **사용 위치**: EventDetailModal - Attendees 정보 아이콘
- **크기**: 20x20px
- **컴포넌트**: `src/app/student/home/calendar/components/EventDetailModal.tsx` (line 9)

#### 46. **calendar/attendance.svg** - 출석 체크 아이콘
- **경로**: `/images/icons/calendar/attendance.svg`
- **사용 위치**: EventDetailModal - "Your Attendance" 섹션 헤더
- **크기**: 20x20px
- **컴포넌트**: `src/app/student/home/calendar/components/EventDetailModal.tsx` (line 10)

#### 47. **calendar/bell.svg** - 알림 구독 아이콘
- **경로**: `/images/icons/calendar/bell.svg`
- **사용 위치**: EventDetailModal - "Subscribe to Updates" 버튼
- **크기**: 20x20px
- **컴포넌트**: `src/app/student/home/calendar/components/EventDetailModal.tsx` (line 11)

---

## 🔧 미작업 항목

### Welcome Page 로컬 변환 ✅
- [x] Logo ✅
- [x] Student Access 아이콘 ✅
- [x] Admin Access 아이콘 ✅
- [x] Arrow (버튼) ✅
- [x] Feature Card 아이콘 3개 ✅

### Student Login Page 로컬 변환 (부분 완료)
- [x] Student Portal 아이콘 ✅
- [x] Sign In 버튼 화살표 ✅
- [ ] 모달 아이콘들 (변경 예정으로 보류)
  - close.svg
  - info.svg
  - check.svg
  - send.svg

### Browse Clubs Page 로컬 변환 ✅
- [x] 검색 아이콘 ✅
- [x] 필터 아이콘 ✅
- [x] 시계 아이콘 ✅
- [x] 위치 아이콘 ✅
- [x] 회원 수 아이콘 ✅
- [x] 하트 (즐겨찾기) ✅
- [x] 공유 아이콘 ✅
- [x] 공용 아이콘 재사용 (logo, profile, search) ✅
- [ ] Chevron 아이콘 (CSS로 대체)

### Calendar Page 로컬 변환 ✅
- [x] View Mode 아이콘 ✅
- [x] Month View 아이콘 ✅
- [x] Week View 아이콘 ✅
- [x] Create 버튼 아이콘 ✅
- [x] 화살표 아이콘 (좌/우) ✅
- [x] Upcoming 아이콘 ✅
- [x] Export 아이콘 ✅
- [x] 모달 Close 아이콘 ✅
- [x] 날짜 선택 아이콘 ✅
- [x] 위치 아이콘 2종 (location, location2) ✅
- [x] 시간 아이콘 ✅
- [x] 참석자 아이콘 ✅
- [x] 출석 체크 아이콘 ✅
- [x] 알림 구독 아이콘 ✅
- [x] 공용 아이콘 재사용 (logo, search, profile) ✅

### Club Detail Page 로컬 변환 ✅
- [x] 뒤로가기 화살표 ✅
- [x] 회원 수 아이콘 ✅
- [x] 설립 연도 아이콘 ✅
- [x] 공유 버튼 ✅
- [x] 구독 버튼 ✅
- [x] 이메일 아이콘 (small) ✅
- [x] 정기 일정 아이콘 ✅
- [x] 화살표 (View on Calendar) ✅
- [x] 위치 아이콘 ✅
- [x] 캠퍼스 맵 아이콘 ✅
- [x] 참석자 아이콘 ✅
- [x] Quick Info 아이콘 3종 (users-red, clock-blue, contact-green) ✅
- [x] 알림 아이콘 ✅
- [x] 이메일 아이콘 (Subscribe) ✅
- [x] 공용 아이콘 재사용 (logo) ✅
- [ ] 커멘트 섹션 아이콘 (삭제 예정)

---

## 📝 업데이트 로그

- **2026-01-31**: 초기 문서 생성
  - Student Home 페이지 아이콘 (8개) 정리
  - AI Recommendations 페이지 전용 아이콘 (7개) 정리
  - Welcome Page 미작업 항목 기록
  
- **2026-01-31**: Welcome Page 로컬 변환 완료
  - Welcome 페이지 전용 아이콘 (7개) 추가
  - 모든 Figma URL을 로컬 경로로 변경
  - 총 22개 아이콘 문서화 완료

- **2026-01-31**: Student Login Page 부분 로컬 변환
  - InfoPanel과 LoginForm 아이콘 (2개) 추가
  - 모달 아이콘은 변경 예정으로 보류
  - 총 24개 아이콘 문서화 완료

- **2026-01-31**: Browse Clubs Page 로컬 변환 완료
  - clubs/ 폴더 생성 및 아이콘 7개 추가
  - 공용 아이콘 3개 재사용 (logo, profile, header-search)
  - chevron 아이콘은 CSS로 대체 구현
  - 총 31개 아이콘 문서화 완료

- **2026-01-31**: Calendar Page 로컬 변환 완료
  - calendar/ 폴더 생성 및 아이콘 16개 추가
  - 공용 아이콘 3개 재사용 (logo, search, profile)
  - location 아이콘 2종 (CreateEventModal, EventDetailModal)
  - 총 47개 아이콘 문서화 완료

- **2026-01-31**: Club Detail Page 로컬 변환 완료
  - club-detail/ 폴더 생성 및 아이콘 16개 추가
  - 공용 아이콘 1개 재사용 (logo)
  - inline SVG를 모두 로컬 아이콘으로 변경
  - 커멘트 섹션 아이콘은 Figma URL 유지 (섹션 삭제 예정)
  - 총 63개 아이콘 문서화 완료

---

## 💡 팁

### CSS에서 아이콘 색상 변경
```css
.icon {
  filter: brightness(0) saturate(100%) invert(100%); /* 흰색으로 */
  opacity: 0.8;
}
```

### SVG 직접 수정 (색상)
```xml
<svg>
  <path fill="#FFFFFF" ... />
</svg>
```

### Next.js Image 컴포넌트 사용
```tsx
import Image from 'next/image';

<Image 
  src="/images/icons/logo.svg" 
  alt="Logo" 
  width={24} 
  height={24}
/>
```
