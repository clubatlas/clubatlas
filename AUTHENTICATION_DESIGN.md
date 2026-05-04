# ClubAtlas Authentication & Authorization Design

## Phase 1: Member Model & Role Assignment Policy Design

Written: 2026-01-31  
Status: Design complete

---

## 1. Role Model Definition

### 1.1 Role Types & Permissions

#### Student
- **Permission level**: 1 (lowest)
- **Accessible areas**:
  - `/student/*` - All student pages
  - Club discovery and detail view
  - Event calendar
  - AI recommendations
  - My page
  - Club subscription/notification settings
- **Restrictions**:
  - Cannot manage clubs
  - Cannot create/edit events
  - Cannot access admin pages

#### Club Leader
- **Permission level**: 2
- **Accessible areas**:
  - `/admin/*` - Club admin dashboard
  - Edit profile for clubs they manage
  - Create/edit/delete events
  - Post announcements
  - Manage subscribers
  - **Includes Student permissions** (can access student pages)
- **Restrictions**:
  - Can only manage their own clubs
  - Cannot edit other clubs
  - Cannot configure system settings

#### Admin
- **Permission level**: 2 (same as Club Leader)
- **Definition**: `admin` is used as a synonym for `club-leader`
- **Reason**: Codebase checks both `admin` and `club-leader` together without distinction
- **Reference**: `backend/app/api/dependencies.py:109`, `firestore.rules:22`

#### Super Admin
- **Permission level**: 3 (highest)
- **Accessible areas**:
  - `/superadmin/*` - System management pages
  - Manage all clubs (create/edit/delete)
  - Grant/revoke club leader permissions
  - Change user roles
  - System configuration and analytics
  - **Includes Club Leader + Student permissions**
- **Restrictions**: None (full system access)

---

## 2. Signup Flow

### 2.1 Student Signup
```
[User Input]
├─ Email (required)
├─ Password (required, 8+ characters)
├─ Name (First Name, Last Name)
├─ Student ID
└─ Major/Department

[Process]
1. Create account in Firebase Authentication (signUp)
2. Backend API call: POST /api/auth/signup/student
3. Create profile in Firestore users collection
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
4. Auto-login
5. Redirect to /student/home

[Result]
- ✅ Immediate approval (no manual approval required)
- ✅ All student features available
```

### 2.2 Club Leader Signup (Access Request)
```
[Initial Signup]
1. Sign up as Student (same flow as above)
2. Enter /student/home

[Leader Access Request]
User visits /admin/request-access page

[Request Form Input]
├─ Name (auto-filled from profile)
├─ Email (auto-filled from profile)
├─ Requested club (select existing or request new)
├─ Role (President, Vice President, Treasurer, etc.)
└─ Reason (text input)

[Process]
1. Backend API call: POST /api/auth/leader-access/request
2. Create document in Firestore leader_access_requests collection
   {
     id: string (auto-generated)
     user_id: string (current user UID)
     email: string
     display_name: string
     requested_club_id: string | null
     requested_club_name: string (for new club creation request)
     requested_role: string (President, Vice President, etc.)
     reason: string
     status: "pending"
     requested_at: timestamp
     processed_at: null
     processed_by: null
     admin_notes: null
   }
3. Show request complete message
4. Send email notification (optional)

[Pending State]
- User continues with Student permissions
- Can check progress on request status page

[SuperAdmin Approval]
SuperAdmin at /superadmin/club-leaders:
1. View request list
2. Review request details
3. Approve or reject
   - On approval:
     a. Set Firebase Custom Claims: {"role": "club-leader"}
     b. Update Firestore users/{uid}: role = "club-leader"
     c. Add leader to club (add to clubs/{club_id}/leaders array)
     d. Update leader_access_requests document: status = "approved"
   - On rejection:
     a. Update leader_access_requests document: status = "rejected"
     b. Enter rejection reason (admin_notes)

[After Approval]
- User gains club-leader permission on next login
- Can access /admin/dashboard
```

### 2.3 Super Admin Creation (Manual Only)
```
[Creation Method]
Option 1: Firebase Console manual creation
1. Create user in Firebase Console > Authentication
2. Set {"role": "super-admin"} in Firebase Console > Authentication > User > Custom Claims

Option 2: Run backend script
1. Run backend/scripts/create_superadmin.py
   $ cd backend
   $ python scripts/create_superadmin.py
2. Script performs:
   a. Create account in Firebase Auth
   b. Set Custom Claims: {"role": "super-admin"}
   c. Create profile in Firestore users collection
      {
        uid: string
        email: string
        display_name: string
        role: "super-admin"
        created_at: timestamp
        updated_at: timestamp
      }

[Restrictions]
- ❌ SuperAdmin signup via web UI not allowed
- ❌ Regular users cannot request SuperAdmin permissions
- ✅ Only existing SuperAdmins can create new SuperAdmins (to be implemented)
```

---

## 3. Login Flow

### 3.1 Student Login
```
[Path]
/student/login

[Input]
- Email
- Password

[Process]
1. Firebase signInWithEmailAndPassword
2. Backend API call: GET /api/auth/me (token verification and profile retrieval)
3. Role check:
   - role === "student" → ✅ proceed
   - role !== "student" → ⚠️ error message (login required with different role)
4. Redirect to /student/home

[Error Handling]
- Email/password mismatch: "Invalid email or password"
- Account disabled: "This account has been disabled"
- Role mismatch: "Please use the Admin login for club leaders"
```

### 3.2 Admin/SuperAdmin Login
```
[Path]
/admin/login

[UI Features]
- Role selection toggle: [Club Leader] / [Super Admin]
- Placeholder and guidance text changes based on selected role

[Input]
- Role selection (club-leader or super-admin)
- Email
- Password

[Process]
1. Firebase signInWithEmailAndPassword
2. Backend API call: GET /api/auth/me
3. Role check:
   - Selected role === "club-leader"
     → role is "club-leader" or "admin" → /admin/dashboard
     → role is "super-admin" → role mismatch error
   - Selected role === "super-admin"
     → role is "super-admin" → /superadmin/dashboard
     → otherwise → role mismatch error

[Error Handling]
- Role mismatch: "You don't have [role] permissions. Please select the correct role or contact an administrator."
- Permission pending: "Your leader access request is pending approval. You'll receive an email once approved."
```

---

## 4. Firestore Data Structure

### 4.1 users collection
```typescript
interface User {
  uid: string;                    // Firebase UID (document ID)
  email: string;
  display_name: string;
  role: "student" | "club-leader" | "admin" | "super-admin";

  // Student-specific fields
  student_id?: string;
  department?: string;
  interests?: string[];
  recommendation_preferences?: {
    preferred_categories: string[];
    preferred_activity_types: string[];
    available_time_slots: string[];
    last_updated: timestamp;
    source: "ai-form" | "profile";
  };

  // Club Leader-specific fields
  managed_club_ids?: string[];    // List of managed club IDs
  leader_position?: string;       // President, Vice President, etc.

  // Common fields
  created_at: timestamp;
  updated_at: timestamp;
  is_active: boolean;
}
```

### 4.2 leader_access_requests collection (new)
```typescript
interface LeaderAccessRequest {
  id: string;                     // Document ID (auto-generated)
  user_id: string;                // Requester UID
  email: string;
  display_name: string;

  // Request content
  requested_club_id: string | null;
  requested_club_name: string | null;
  requested_role: string;
  reason: string;

  // Status
  status: "pending" | "approved" | "rejected";
  requested_at: timestamp;
  processed_at: timestamp | null;
  processed_by: string | null;    // Processing SuperAdmin UID
  admin_notes: string | null;

  // On approval
  assigned_club_id?: string;
}
```

### 4.3 clubs collection - leaders field
```typescript
interface Club {
  // ... existing fields ...

  leaders: {
    uid: string;
    name: string;
    role: string;
    email: string;
  }[];

  // ... remaining fields ...
}
```

---

## 5. Firebase Custom Claims Strategy

### 5.1 Why Use Custom Claims
Includes role information in the Firebase ID token so the client can also verify roles.

### 5.2 Setting Claims
```python
# backend/app/services/auth_service.py
from firebase_admin import auth

async def set_user_role(uid: str, role: str) -> bool:
    """Set user role in both Firebase Custom Claims and Firestore"""
    try:
        # 1. Set Firebase Custom Claims
        auth.set_custom_user_claims(uid, {"role": role})

        # 2. Update Firestore profile
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

### 5.3 Reading Claims
```typescript
// Check role on frontend
const user = auth.currentUser;
if (user) {
  const token = await user.getIdTokenResult();
  const role = token.claims.role;  // "student", "club-leader", "super-admin"
}
```

---

## 6. Permission Verification Strategy

### 6.1 Backend Permission Verification (Layered Approach)

#### Layer 1: Firebase Custom Claims
```python
# backend/app/api/dependencies.py

async def get_current_user(authorization: str = Header(None)) -> dict:
    """Verify token and return user info"""
    token = extract_bearer_token(authorization)
    decoded = await verify_id_token(token)

    # decoded includes custom claims
    # decoded['role'] or decoded['custom_claims']['role']
    return decoded
```

#### Layer 2: Firestore Profile Check
```python
async def verify_user_role(uid: str, required_role: str) -> bool:
    """Re-verify role in Firestore (double verification)"""
    user_profile = await user_service.get_user_profile(uid)
    return user_profile and user_profile.get('role') == required_role
```

#### Layer 3: Per-Endpoint Guards
```python
# Only specific roles can access
@router.post("/clubs")
async def create_club(
    club_data: ClubCreate,
    current_user: dict = Depends(require_admin)  # admin or super-admin only
):
    pass

# Resource ownership check
@router.put("/clubs/{club_id}")
async def update_club(
    club_id: str,
    current_user: dict = Depends(require_club_leader)
):
    # Additional check: verify this leader manages this club
    club = await club_service.get_club(club_id)
    leader_uids = [l['uid'] for l in club.get('leaders', [])]

    if current_user['uid'] not in leader_uids and current_user.get('role') != 'super-admin':
        raise HTTPException(status_code=403, detail="Not authorized for this club")

    # ... update logic ...
```

### 6.2 Frontend Permission Verification (UI Level + Route Guard)

#### UI Level: Conditional Rendering
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

// Usage example
const { isClubLeader } = useAuth();
{isClubLeader && <button>Edit Club</button>}
```

#### Route Guard: Page Access Control
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

    // Users collection
    match /users/{userId} {
      allow read: if request.auth.uid == userId || isSuperAdmin();
      allow update: if request.auth.uid == userId
                    && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role']);
    }

    // Clubs collection
    match /clubs/{clubId} {
      allow read: if request.auth != null;
      allow write: if isClubLeader() || isSuperAdmin();
    }

    // Leader Access Requests collection
    match /leader_access_requests/{requestId} {
      allow read: if request.auth.uid == resource.data.user_id || isSuperAdmin();
      allow create: if isStudent() && request.auth.uid == request.resource.data.user_id;
      allow update: if isSuperAdmin();
    }
  }
}
```

---

## 7. Role Transition Scenarios

### 7.1 Student → Club Leader
```
1. Student requests leader access at /admin/request-access
2. leader_access_requests document created (status: "pending")
3. SuperAdmin reviews request at /superadmin/club-leaders
4. SuperAdmin approves:
   a. Call set_user_role(uid, "club-leader")
   b. Update Firebase Custom Claims
   c. Firestore users/{uid}.role = "club-leader"
   d. Add to clubs/{club_id}.leaders array
   e. Update leader_access_requests document (status: "approved")
5. User can access as club-leader on next login
   (or provide token force-refresh API)
```

### 7.2 Club Leader → Student (Permission Revocation)
```
SuperAdmin at /superadmin/club-leaders:
1. Select leader → Click "Remove Leader"
2. Confirmation modal displayed
3. On confirm:
   a. Call set_user_role(uid, "student")
   b. Update Firebase Custom Claims
   c. Firestore users/{uid}.role = "student"
   d. Remove from clubs/{club_id}.leaders array
   e. Clear managed_club_ids
4. User can only access as student on next login
```

---

## 8. Security Considerations

### 8.1 Token Management
- Firebase ID tokens auto-refresh every 1 hour
- Force token refresh required for immediate role change reflection
```typescript
// Force token refresh after role change
await user.getIdToken(true);  // forceRefresh = true
```

### 8.2 Double Verification
- Client role check: UX improvement (prevents unnecessary API calls)
- Server role check: Security (actual permission verification)
- Firestore Rules: Backup security layer

### 8.3 Role Tampering Prevention
- Custom Claims cannot be modified by client
- Firestore users.role field protected by Security Rules
- Only backend APIs can change roles (SuperAdmin permission required)

---

## 9. Future Expansion Considerations

### 9.1 Granular Permissions (Future)
Currently role-based (RBAC), can expand to permission-based (PBAC) later
```typescript
interface User {
  role: string;
  permissions?: string[];  // ["clubs.create", "events.edit", ...]
}
```

### 9.2 Multiple Club Leaders
A user can be a leader of multiple clubs
```typescript
interface User {
  managed_club_ids: string[];  // Already included in design
}
```

### 9.3 Temporary Permissions
Grant leader permissions for a specific period (per-semester renewal, etc.)
```typescript
interface User {
  role_expires_at?: timestamp;
}
```

---

## 10. Implementation Checklist

After completing Phase 1:

### Backend
- [ ] Create `backend/app/models/auth.py` (request/response models)
- [ ] Create `backend/app/api/auth.py` (signup API)
- [ ] Create `backend/app/api/admin/leader_requests.py` (leader request management)
- [ ] Extend `backend/app/services/auth_service.py` (role assignment logic)
- [ ] Create `backend/scripts/create_superadmin.py`

### Frontend
- [ ] Create `src/contexts/AuthContext.tsx`
- [ ] Create `src/lib/api/auth.ts`
- [ ] Create `src/components/ProtectedRoute.tsx`
- [ ] Connect login form to Firebase
- [ ] Connect signup form to Firebase
- [ ] Create `src/app/admin/request-access/page.tsx`
- [ ] Implement layout guards

### Firestore
- [ ] Create `leader_access_requests` collection indexes
- [ ] Update Security Rules

### Testing
- [ ] Create 1 SuperAdmin account
- [ ] Test student signup
- [ ] Test leader access request
- [ ] Test role-based access control

---

## 11. Finalized Policy Decisions

### 11.1 Email Domain Restriction
**Decision**: Allow all email domains
- No restrictions for students or leaders
- Considered for ease of testing and development

### 11.2 Leader Access Request UI
**Decision**: Reuse existing UI style
- Create `/admin/request-access` page (link already exists in AdminLoginForm)
- Use existing login/signup form styles
- SuperAdmin management: Add "Pending Requests" tab to `/superadmin/club-leaders` page

### 11.3 Initial SuperAdmin Account
**Confirmed info**:
```
Email: superadmin@gmail.com
Password: Super123
Name: superadmin
```
(Changed to meet Firebase minimum 6-character requirement)

### 11.4 Password Policy
**Decision**: Strict policy
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- Regex: `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$`

### 11.5 Role Names
**Finalized**:
- `admin` = `club-leader` (complete synonyms)
- `super-admin`: Top-level permission (separate role)
- Both backend and frontend use `club-leader` consistently
- `admin` treated identically for legacy compatibility

---

## 12. Implementation Completion Status

### 12.1 Completed Steps ✅
- ✅ **Step 1**: Backend auth API implementation complete
  - Student signup, leader access request, user info API
  - SuperAdmin access request management API
- ✅ **Step 2**: Role-Based Access Control (RBAC) complete
  - Firebase Custom Claims
  - Firestore role synchronization
  - Backend dependency functions (`require_super_admin`, `require_club_leader`)
  - Frontend `ProtectedRoute` component
- ✅ **Step 3**: Frontend auth logic implementation complete
  - Student/Admin/SuperAdmin login pages
  - Student signup page
  - Leader access request page
  - Role-based auto-redirect
  - `AuthContext` global state management
- ✅ **Step 4**: SuperAdmin access request management UI complete
  - "Pending Requests" tab added to `/superadmin/club-leaders`
  - Approve/reject modals implemented
  - Real-time API integration
- ✅ **Step 5**: Logout functionality complete
  - Logout added to Student/Admin/SuperAdmin headers
  - Redirect to role-specific login page
- ✅ **Step 7**: Profile editing complete
  - Common `EditProfileModal` component
  - Student/Admin/SuperAdmin integration

### 12.2 Deferred/Unimplemented Steps ⏸️
- ⏸️ **Step 6**: Password Reset (Forgot Password)
  - Will use Firebase Password Reset Email
  - Planned location: `src/app/student/login/components/ForgotPasswordModal.tsx`

### 12.3 Tested Items
- ✅ SuperAdmin account creation (`superadmin@gmail.com` / `Super123`)
- ✅ SuperAdmin login and dashboard access
- ✅ Role-based access control verification
- ✅ Logout functionality confirmed
- ✅ Profile editing and real-time reflection confirmed

### 12.4 Key Files Created
**Backend**:
- `backend/app/api/auth.py` - Auth API
- `backend/app/api/admin/leader_requests.py` - SuperAdmin leader request management
- `backend/app/models/auth.py` - Auth-related Pydantic models
- `backend/scripts/create_superadmin.py` - Initial SuperAdmin creation script
- `backend/app/services/auth_service.py` - Auth service logic

**Frontend**:
- `src/contexts/AuthContext.tsx` - Global auth context
- `src/components/ProtectedRoute.tsx` - Route protection component
- `src/components/EditProfileModal.tsx` - Profile editing modal
- `src/lib/api/auth.ts` - Auth API client
- `src/lib/api/admin.ts` - SuperAdmin API client
- `src/lib/api/users.ts` - User API client
- `src/lib/api/clubs.ts` - Club API client
- `src/app/admin/request-access/page.tsx` - Leader access request page
- `src/app/superadmin/club-leaders/components/PendingRequestsTable.tsx` - Pending requests table
- `src/app/superadmin/club-leaders/components/ApproveRequestModal.tsx` - Approval modal
- `src/app/superadmin/club-leaders/components/RejectRequestModal.tsx` - Rejection modal

### 12.5 Next Features to Implement
1. **Password reset** (Step 6)
2. **Dummy data Firestore migration**
3. **Admin Dashboard real data integration**
4. **Event management system**
5. **Subscription system**
6. **AI recommendation system frontend integration**

See [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for detailed status.

---

## Document Version
- v1.0 - 2026-01-31: Initial draft
- v1.1 - 2026-01-31: Policy decisions finalized
- v1.2 - 2026-01-31: Implementation completion status added
