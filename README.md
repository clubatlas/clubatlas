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
   - Month/week view, iCal export, event attendance registration
   - Club leaders can create and manage events directly from the calendar

3. **AI Recommendation Assistant**
   - Suggests relevant clubs based on user-stated interests (tags/checkboxes) and usage behavior
   - Hybrid Collaborative Filtering (content-based + collaborative filtering)
   - Preference input → backend scoring → ranked club list

4. **Subscription & Notification System**
   - Students can subscribe/unsubscribe to clubs with per-club notification settings
   - In-app notifications for event reminders, cancellations, and announcements

5. **Club Leader Dashboard**
   - Event management (create/edit/delete, send reminders)
   - Announcement management (create/edit/delete)
   - Subscriber management with details
   - Club profile editing (basic info, leadership, meeting info, photo gallery)
   - Analytics dashboard

6. **SuperAdmin Dashboard**
   - Leader access request management (approve/reject with club assignment)
   - Password reset request management
   - All clubs management (create/edit/deactivate)
   - Student users overview with activity charts
   - Platform analytics and system settings

7. **Student My Page**
   - Personal overview: subscribed clubs, attendance history, saved recommendations

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

- **Notification**
  - Tracks notifications per user
  - Type (event reminder, event cancelled, announcement, etc.)

- **Recommendation Data / Recommendation History**
  - Logs recommendation scores from the recommendation engine

### AI Recommendation Engine

- Recommendation logic is implemented as a **modular service** (`backend/app/services/recommendation_service.py`):
  - Hybrid Collaborative Filtering (content-based + collaborative filtering)
  - Extensible to ML/LLM-based approaches
- Frontend preference input → backend scoring → ranked club list

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
5. **SuperAdmin dashboard**
6. **AI recommendations**
7. **Student "My Page" dashboard**

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
- [AUTHENTICATION_DESIGN.md](./AUTHENTICATION_DESIGN.md) - Authentication system detailed design
- [ICON_REFERENCE.md](./ICON_REFERENCE.md) - Icon usage guidelines
