# SuperAdmin API 문서

Password Reset Requests를 제외한 모든 SuperAdmin API가 구현되었습니다.

## 인증
모든 SuperAdmin API는 `Authorization: Bearer <token>` 헤더와 `super-admin` 역할이 필요합니다.

---

## Dashboard APIs

### 1. 플랫폼 전체 통계
```
GET /api/superadmin/statistics
```

**응답:**
```json
{
  "total_clubs": 47,
  "active_clubs": 42,
  "inactive_clubs": 5,
  "pending_clubs": 0,
  "total_leaders": 52,
  "active_leaders": 47,
  "pending_leader_requests": 5,
  "total_students": 1234,
  "new_students_this_week": 89,
  "total_events": 156,
  "upcoming_events": 42,
  "total_subscriptions": 2345
}
```

### 2. 승인 대기 항목 조회
```
GET /api/superadmin/pending-approvals?limit=10
```

**Query Parameters:**
- `limit` (optional): 최대 개수 (기본값: 10)

**응답:**
```json
{
  "approvals": [
    {
      "id": "request_123",
      "type": "leader_request",
      "title": "Leader Access Request",
      "subtitle": "Drama Society • john.doe@email.edu",
      "timestamp": "2026-02-15T10:00:00Z",
      "metadata": {
        "user_id": "user_123",
        "email": "john.doe@email.edu",
        "display_name": "John Doe",
        "requested_role": "President",
        "requested_club_id": "club_456",
        "requested_club_name": "Drama Society"
      }
    }
  ],
  "total": 5
}
```

### 3. 최근 클럽 활동 로그
```
GET /api/superadmin/recent-activities?limit=20
```

**Query Parameters:**
- `limit` (optional): 최대 개수 (기본값: 20)

**응답:**
```json
{
  "activities": [
    {
      "id": "club_123",
      "type": "club_created",
      "title": "New club created",
      "subtitle": "Sustainability Initiative",
      "timestamp": "2026-02-15T09:00:00Z",
      "is_new": true
    },
    {
      "id": "event_456",
      "type": "event_posted",
      "title": "Event posted",
      "subtitle": "Robotics Workshop • Robotics Club",
      "timestamp": "2026-02-15T08:00:00Z",
      "is_new": false
    }
  ],
  "total": 15
}
```

### 4. 시스템 알림
```
GET /api/superadmin/system-alerts?limit=10
```

**Query Parameters:**
- `limit` (optional): 최대 개수 (기본값: 10)

**응답:**
```json
{
  "alerts": [
    {
      "id": "alert_1",
      "message": "System backup completed successfully",
      "type": "success",
      "timestamp": "2026-02-15T09:30:00Z"
    }
  ],
  "total": 3
}
```

---

## Club Leaders Management APIs

### 5. 모든 Club Leaders 조회
```
GET /api/superadmin/club-leaders?status_filter=active
```

**Query Parameters:**
- `status_filter` (optional): `active` | `inactive`

### 6. Club Leader 정보 업데이트
```
PUT /api/superadmin/club-leaders/{uid}
```

**Request Body:**
```json
{
  "display_name": "Updated Name",
  "club_id": "new_club_id"
}
```

### 7. Club Leader 상태 업데이트
```
PUT /api/superadmin/club-leaders/{uid}/status?status=inactive
```

**Query Parameters:**
- `status` (required): `active` | `inactive`

### 8. Club Leader 할당
```
POST /api/superadmin/club-leaders/assign
```

**Request Body:**
```json
{
  "email": "leader@email.edu",
  "club_id": "club_123",
  "role_title": "President"
}
```

### 9. Club Leader 삭제
```
DELETE /api/superadmin/club-leaders/{uid}
```

---

## All Clubs Management APIs

### 10. 모든 클럽 조회 (SuperAdmin 전용)
```
GET /api/superadmin/clubs?search=robotics&category=STEM&status=active&page=1&page_size=20
```

**Query Parameters:**
- `search` (optional): 검색어 (클럽 이름)
- `category` (optional): 카테고리 필터
- `status` (optional): `active` | `inactive`
- `page` (optional): 페이지 번호 (기본값: 1)
- `page_size` (optional): 페이지 크기 (기본값: 20)

**응답:**
```json
{
  "clubs": [
    {
      "id": "club_123",
      "name": "Robotics Club",
      "description": "Building robots",
      "categories": ["STEM", "Tech"],
      "activity_type": "Academic",
      "leader_name": "Sarah Johnson",
      "leader_email": "sarah@email.edu",
      "total_subscribers": 127,
      "total_events": 8,
      "status": "active",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2026-02-15T10:00:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "page_size": 20
}
```

### 11. 클럽 생성 (SuperAdmin 전용)
```
POST /api/superadmin/clubs
```

**Request Body:**
```json
{
  "name": "New Club",
  "description": "Club description",
  "categories": ["Arts", "Culture"],
  "activity_type": "Social",
  "leader_email": "leader@email.edu",
  "contact_email": "contact@email.edu",
  "tagline": "Short tagline"
}
```

### 12. 클럽 수정 (SuperAdmin 전용)
```
PUT /api/superadmin/clubs/{club_id}
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "is_active": true
}
```

### 13. 클럽 삭제 (SuperAdmin 전용)
```
DELETE /api/superadmin/clubs/{club_id}?hard_delete=false
```

**Query Parameters:**
- `hard_delete` (optional): `true` (완전 삭제) | `false` (비활성화, 기본값)

### 14. 클럽 통계
```
GET /api/superadmin/clubs/stats
```

**응답:**
```json
{
  "active_clubs": 42,
  "pending_approval": 0,
  "total_subscribers": 2345
}
```

---

## Student Users APIs

### 15. 학생 사용자 통계
```
GET /api/superadmin/students/statistics
```

**응답:**
```json
{
  "total_users": 1234,
  "active_this_month": 892,
  "new_this_week": 89,
  "avg_subscriptions": 3.2
}
```

### 16. 학생 활동 추이 차트
```
GET /api/superadmin/students/activity-chart?days=30
```

**Query Parameters:**
- `days` (optional): 조회 기간 (7-90일, 기본값: 30)

**응답:**
```json
{
  "labels": ["02/01", "02/02", "02/03", ...],
  "datasets": [
    {
      "label": "New Signups",
      "data": [12, 15, 8, 20, ...],
      "borderColor": "#3b82f6",
      "backgroundColor": "rgba(59, 130, 246, 0.1)"
    }
  ]
}
```

---

## Platform Analytics APIs

### 17. 플랫폼 분석 개요
```
GET /api/superadmin/analytics/overview
```

**응답:**
```json
{
  "total_page_views": 23456,
  "club_profile_views": 8234,
  "avg_engagement": 67.0,
  "avg_session_time": 4.2
}
```

### 18. 트래픽 차트
```
GET /api/superadmin/analytics/traffic?days=30
```

**Query Parameters:**
- `days` (optional): 조회 기간 (7-90일, 기본값: 30)

**응답:**
```json
{
  "labels": ["02/01", "02/02", "02/03", ...],
  "datasets": [
    {
      "label": "Page Views",
      "data": [150, 180, 120, 200, ...],
      "borderColor": "#8b5cf6",
      "backgroundColor": "rgba(139, 92, 246, 0.1)"
    }
  ]
}
```

### 19. 인기 클럽 순위
```
GET /api/superadmin/analytics/popular-clubs?limit=10
```

**Query Parameters:**
- `limit` (optional): 최대 개수 (1-50, 기본값: 10)

**응답:**
```json
{
  "clubs": [
    {
      "rank": 1,
      "club_id": "club_123",
      "name": "Drama Society",
      "views": 1234,
      "subscribers": 156,
      "events": 12
    }
  ],
  "total": 10
}
```

---

## System Settings APIs

### 20. 플랫폼 설정 조회
```
GET /api/superadmin/system/configurations
```

**응답:**
```json
{
  "configurations": [
    {
      "id": "new-club-approvals",
      "title": "New Club Approvals",
      "description": "Require admin approval for new clubs",
      "enabled": true
    },
    {
      "id": "email-notifications",
      "title": "Email Notifications",
      "description": "System email notifications",
      "enabled": true
    },
    {
      "id": "public-registration",
      "title": "Public Registration",
      "description": "Allow public user registration",
      "enabled": true
    }
  ]
}
```

### 21. 플랫폼 설정 업데이트
```
PUT /api/superadmin/system/configurations/{config_id}
```

**Path Parameters:**
- `config_id`: `new-club-approvals` | `email-notifications` | `public-registration`

**Request Body:**
```json
{
  "enabled": false
}
```

### 22. 데이터베이스 백업 생성
```
POST /api/superadmin/system/backup
```

**응답:**
```json
{
  "message": "Backup created successfully",
  "backup_id": "backup_123",
  "timestamp": "2026-02-15T10:00:00Z",
  "size": "N/A"
}
```

### 23. 시스템 캐시 클리어
```
POST /api/superadmin/system/clear-cache
```

**응답:**
```json
{
  "message": "Cache cleared successfully",
  "cleared_items": 0,
  "timestamp": "2026-02-15T10:00:00Z"
}
```

### 24. 시스템 정보 조회
```
GET /api/superadmin/system/info
```

**응답:**
```json
{
  "version": "ClubAtlas v1.0.0",
  "uptime": "N/A",
  "database_size": "2.4 MB",
  "storage_used": "N/A",
  "total_storage": "N/A",
  "last_backup": "2026-02-15T09:00:00Z"
}
```

---

## 에러 응답

모든 API는 에러 발생 시 다음 형식으로 응답합니다:

```json
{
  "detail": "Error message description"
}
```

**일반적인 HTTP 상태 코드:**
- `200 OK`: 성공
- `201 Created`: 리소스 생성 성공
- `204 No Content`: 성공 (응답 본문 없음)
- `400 Bad Request`: 잘못된 요청
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 권한 부족
- `404 Not Found`: 리소스를 찾을 수 없음
- `500 Internal Server Error`: 서버 오류

---

## 구현 상태

✅ **완료된 API:**
- Dashboard APIs (4개)
- Club Leaders Management (5개)
- All Clubs Management (5개)
- Student Users (2개)
- Platform Analytics (3개)
- System Settings (5개)

**총 24개 API 엔드포인트 구현 완료**

❌ **미구현:**
- Password Reset Requests (사용자 요청에 따라 제외)
