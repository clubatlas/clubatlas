# SuperAdmin API Documentation

All SuperAdmin APIs have been implemented except Password Reset Requests.

## Authentication
All SuperAdmin APIs require `Authorization: Bearer <token>` header and `super-admin` role.

---

## Dashboard APIs

### 1. Platform-wide Statistics
```
GET /api/superadmin/statistics
```

**Response:**
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

### 2. Pending Approvals
```
GET /api/superadmin/pending-approvals?limit=10
```

**Query Parameters:**
- `limit` (optional): max count (default: 10)

**Response:**
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

### 3. Recent Club Activity Log
```
GET /api/superadmin/recent-activities?limit=20
```

**Query Parameters:**
- `limit` (optional): max count (default: 20)

**Response:**
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

### 4. System Alerts
```
GET /api/superadmin/system-alerts?limit=10
```

**Query Parameters:**
- `limit` (optional): max count (default: 10)

**Response:**
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

### 5. Get All Club Leaders
```
GET /api/superadmin/club-leaders?status_filter=active
```

**Query Parameters:**
- `status_filter` (optional): `active` | `inactive`

### 6. Update Club Leader Info
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

### 7. Update Club Leader Status
```
PUT /api/superadmin/club-leaders/{uid}/status?status=inactive
```

**Query Parameters:**
- `status` (required): `active` | `inactive`

### 8. Assign Club Leader
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

### 9. Delete Club Leader
```
DELETE /api/superadmin/club-leaders/{uid}
```

---

## All Clubs Management APIs

### 10. Get All Clubs (SuperAdmin only)
```
GET /api/superadmin/clubs?search=robotics&category=STEM&status=active&page=1&page_size=20
```

**Query Parameters:**
- `search` (optional): search term (club name)
- `category` (optional): category filter
- `status` (optional): `active` | `inactive`
- `page` (optional): page number (default: 1)
- `page_size` (optional): page size (default: 20)

**Response:**
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

### 11. Create Club (SuperAdmin only)
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

### 12. Update Club (SuperAdmin only)
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

### 13. Delete Club (SuperAdmin only)
```
DELETE /api/superadmin/clubs/{club_id}?hard_delete=false
```

**Query Parameters:**
- `hard_delete` (optional): `true` (permanent delete) | `false` (deactivate, default)

### 14. Club Statistics
```
GET /api/superadmin/clubs/stats
```

**Response:**
```json
{
  "active_clubs": 42,
  "pending_approval": 0,
  "total_subscribers": 2345
}
```

---

## Student Users APIs

### 15. Student User Statistics
```
GET /api/superadmin/students/statistics
```

**Response:**
```json
{
  "total_users": 1234,
  "active_this_month": 892,
  "new_this_week": 89,
  "avg_subscriptions": 3.2
}
```

### 16. Student Activity Trend Chart
```
GET /api/superadmin/students/activity-chart?days=30
```

**Query Parameters:**
- `days` (optional): query period (7-90 days, default: 30)

**Response:**
```json
{
  "labels": ["02/01", "02/02", "02/03", "..."],
  "datasets": [
    {
      "label": "New Signups",
      "data": [12, 15, 8, 20, "..."],
      "borderColor": "#3b82f6",
      "backgroundColor": "rgba(59, 130, 246, 0.1)"
    }
  ]
}
```

---

## Platform Analytics APIs

### 17. Platform Analytics Overview
```
GET /api/superadmin/analytics/overview
```

**Response:**
```json
{
  "total_page_views": 23456,
  "club_profile_views": 8234,
  "avg_engagement": 67.0,
  "avg_session_time": 4.2
}
```

### 18. Traffic Chart
```
GET /api/superadmin/analytics/traffic?days=30
```

**Query Parameters:**
- `days` (optional): query period (7-90 days, default: 30)

**Response:**
```json
{
  "labels": ["02/01", "02/02", "02/03", "..."],
  "datasets": [
    {
      "label": "Page Views",
      "data": [150, 180, 120, 200, "..."],
      "borderColor": "#8b5cf6",
      "backgroundColor": "rgba(139, 92, 246, 0.1)"
    }
  ]
}
```

### 19. Popular Clubs Ranking
```
GET /api/superadmin/analytics/popular-clubs?limit=10
```

**Query Parameters:**
- `limit` (optional): max count (1-50, default: 10)

**Response:**
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

### 20. Get Platform Configurations
```
GET /api/superadmin/system/configurations
```

**Response:**
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

### 21. Update Platform Configuration
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

### 22. Create Database Backup
```
POST /api/superadmin/system/backup
```

**Response:**
```json
{
  "message": "Backup created successfully",
  "backup_id": "backup_123",
  "timestamp": "2026-02-15T10:00:00Z",
  "size": "N/A"
}
```

### 23. Clear System Cache
```
POST /api/superadmin/system/clear-cache
```

**Response:**
```json
{
  "message": "Cache cleared successfully",
  "cleared_items": 0,
  "timestamp": "2026-02-15T10:00:00Z"
}
```

### 24. Get System Info
```
GET /api/superadmin/system/info
```

**Response:**
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

## Error Responses

All APIs return errors in the following format:

```json
{
  "detail": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200 OK`: Success
- `201 Created`: Resource created successfully
- `204 No Content`: Success (no response body)
- `400 Bad Request`: Invalid request
- `401 Unauthorized`: Authentication failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Implementation Status

✅ **Completed APIs:**
- Dashboard APIs (4)
- Club Leaders Management (5)
- All Clubs Management (5)
- Student Users (2)
- Platform Analytics (3)
- System Settings (5)

**Total: 24 API endpoints implemented**

❌ **Not implemented:**
- Password Reset Requests (excluded per requirements)
