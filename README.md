# ClubAtlas

**A web-based centralized club platform for transparent access, AI recommendations, and campus engagement**

## Project Overview

ClubAtlas replaces scattered, last-minute club communication (emails, word-of-mouth) with a **centralized, student-friendly hub**. Students can:

- Discover clubs
- View meeting schedules and past activities
- Subscribe and receive notifications
- Get AI-powered club recommendations

Club leaders can:

- Manage club profiles
- Post announcements and events
- Reach both current members and prospective students

### Key Features

1. **Club Profile Pages**
   - Each club includes: mission, leadership, meeting schedule, past activities, optional media highlights
   - Students can subscribe to each club

2. **Club Calendar**
   - Unified calendar showing upcoming meetings/events
   - Filter by date, club, or category
   - Easy to scan in timeline/month/week style

3. **AI Recommendation Assistant**
   - Suggests relevant clubs based on:
     - User-stated interests (e.g., tags/checkboxes)
     - Usage behavior (viewed clubs, subscribed clubs, attended events) — when available
   - Supports:
     - Active queries (user requests: "Recommend clubs for someone who likes X and Y")
     - Passive discovery (suggestion list on dashboard/home)

4. **Subscription & Notification System**
   - Students can "follow/subscribe" to clubs
   - Receive timely notifications (email and/or in-app) for:
     - New announcements
     - Upcoming meeting reminders
     - Major updates (e.g., time/location changes)

5. **Club Leader / Admin Dashboard**
   - Club leaders can:
     - Edit club profile information
     - Create and edit events (including schedule and location)
     - Post announcements
   - Access is permission-based (leader vs. regular student)

6. **Cross-Club Collaboration Board**
   - A shared board where clubs can:
     - Post joint events
     - Propose collaborations
   - Students can discover these joint events

### Optional Features (Phase 2)

- **Student Dashboard ("My Page")**
  - Personal overview: subscribed clubs, past participation, saved recommendations
  - Architecture should support this, but UI can be minimal in the first iteration

- **Social Interaction Features**
  - Lightweight engagement: comments, reactions
  - Design system should support easy addition later

## Engineering Principles

- Aim for **clean, maintainable, well-structured code** rather than quick hacks
- Prefer clear naming over brevity
- Separate business logic from presentation logic where possible
- Add short, clear comments for complex logic (e.g., recommendation score calculation, subscription/notification dispatch)
- When uncertain about requirements:
  1. First infer from this project overview
  2. If still ambiguous, clearly list assumptions in comments and responses

## Architecture & Data Modeling

### Core Entities

- **User / Student**
  - Basic profile (name, email, etc.)
  - Role flag (e.g., regular student, club leader, admin)
  - Interest tags (for recommendations)

- **Club**
  - Name, mission/description
  - Categories/tags
  - Leadership (links to users who are leaders)
  - Meeting schedule summary (e.g., "Every Tuesday after school")
  - Media (optional images, links, etc.)

- **Club Event**
  - Belongs to a club
  - Title, description
  - Start/end date/time, location
  - Optional category (e.g., recruitment, workshop, social)
  - Visibility status (active, cancelled, etc.)

- **Club Subscription**
  - User ↔ Club relationship
  - Creation date, active flag

- **Announcement**
  - Belongs to a club
  - Title, body
  - Creation date, modification date
  - Visibility status

- **Collaboration Post / Cross-Club Event**
  - Joint post spanning multiple clubs (e.g., many-to-many relationship with clubs)
  - Title, description, date/time, location
  - Supports "Cross-Club Collaboration Board"

- **Notification / Email Queue** (if implemented)
  - Tracks notifications to send or recently sent
  - Type (event reminder, announcement, etc.)

- **Recommendation Data / Recommendation History** (optional)
  - For logging or storing scores from the recommendation engine

### AI Recommendation Engine

- For MVP, design the system so recommendation logic is **modular**:
  - Start simple (e.g., rule-based: tag matching between user interests and club tags)
  - Make it easy to replace/extend with ML/LLM-based recommendations later
- Encapsulate recommendation logic in a dedicated module/service file

## Non-Functional & UX Considerations

- Interface should be **student-friendly and easy to scan**:
  - Club profiles should emphasize:
    - "Is this club right for me?" (mission, tags, activity type)
    - When and where they meet next
  - Calendar view should clearly display conflicts and times

- For club leaders:
  - Keep content management simple and safe:
    - Data validation
    - Prevent accidental data loss
    - Use clear forms for events and announcements

- Access control:
  - Only approved club leaders can modify their own club's content
  - Admins can manage all clubs and moderate collaboration posts

## Figma Design as Source of Truth

- Treat Figma-based specifications as the **primary source of truth for UI layout and visual hierarchy**
- Follow described layout structures, sections, and components as closely as reasonably possible
- Keep components reusable and aligned with Figma semantics (e.g., "ClubCard", "ClubList", "EventCalendarSidebar", etc.)
- Make implementations easy to adjust when Figma designs are updated later

**When matching Figma designs**:
- Respect layout structure (sections, cards, sidebars, headers/footers, spacing)
- Respect primary typography hierarchy (main titles, subtitles, body, meta)
- Respect primary color, border, and corner radius tokens when provided

When there is ambiguity in text specifications:
- Make reasonable assumptions and **document with short comments in code**

## Scope & Priorities

When prioritizing work or making tradeoffs, follow this order:

1. **Core club directory and club profiles**
2. **Club events and calendar**
3. **Subscriptions and notifications**
4. **Club leader dashboard**
5. **Cross-club collaboration board**
6. **Simple, modular AI recommendations (start rule-based)**
7. Optional: Student "My Page" dashboard, social features

If implementing something of lower priority requires minimal additional effort at the current stage (e.g., adding a column now to avoid migration headaches later), that is acceptable — but must be clearly documented.

## Development Guidelines

### Response Structure

When given a task, follow this structure:

1. **Restate** the task in 1-3 sentences to confirm understanding
2. Ask **at most 2-3 precise clarifying questions** if needed. If it can be safely inferred from this specification, prefer inference over questioning
3. Propose a **small-step plan** (1-5 steps)
4. Show specific code changes:
   - File path
   - New/updated code
   - Very short explanation for each significant block

### Prohibited

- Do not silently change or delete existing functionality
- Do not ignore the project overview or feature list above
- Do not over-engineer without clear benefit to this project (building large abstractions)

---

## 📚 Documentation

- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development workflow and guidelines
- [TESTING.md](./TESTING.md) - Testing procedures and troubleshooting
- [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) - Implemented and unimplemented feature status
- [AUTHENTICATION_DESIGN.md](./AUTHENTICATION_DESIGN.md) - Authentication system detailed design
- [ICON_REFERENCE.md](./ICON_REFERENCE.md) - Icon usage guidelines

---

## 🎯 Current Status (2026-01-31)

### ✅ Completed Features
- **3-Role Authentication System** (Student, ClubLeader, SuperAdmin)
- **Role-Based Access Control (RBAC)**
- **Login/Signup for all roles**
- **Leader Access Request System**
- **SuperAdmin Management UI** (Pending Requests approval/rejection)
- **Profile Editing** (all roles)
- **Logout Functionality** (all roles)

### 🚧 In Progress
- None (All planned authentication features completed)

### ⏸️ Pending Features
- Password Reset (Forgot Password)
- Event Management System
- Subscription System
- AI Recommendations Frontend Integration
- File Upload (Firebase Storage)
- Real-time Notifications

**See [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for detailed implementation status.**
