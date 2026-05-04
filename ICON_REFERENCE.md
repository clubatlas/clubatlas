# ClubAtlas Icon Reference Guide

This document lists the location and purpose of all icons used in the project.

## 📁 Icon Folder Structure

```
public/images/icons/
├── logo.svg              # Shared logo (header, navigation, etc.)
├── bell.svg              # Shared notification icon
├── profile.svg           # Shared profile/user icon
├── search.svg            # Search icon
├── arrow-right.svg       # Arrow (buttons, navigation)
├── sparkles.svg          # AI/special feature indicator
├── clock.svg             # Time/schedule display (club schedule)
├── users.svg             # Member count display
├── ai/                   # AI Recommendations page only
│   ├── logo.svg          # Logo for AI page (different design)
│   ├── ai-avatar.svg     # AI assistant avatar
│   ├── assistant.svg     # AI assistant icon
│   ├── star.svg          # AI recommendation banner main icon
│   ├── target.svg        # Personalized match icon
│   ├── clock.svg         # Schedule-related icon (different design)
│   └── bolt.svg          # Instant results icon
├── calendar/             # Calendar page only
│   ├── view-mode.svg     # View Mode icon
│   ├── month-view.svg    # Month View icon
│   ├── week-view.svg     # Week View icon
│   ├── create.svg        # Create button icon
│   ├── arrow-left.svg    # Previous month arrow
│   ├── arrow-right.svg   # Next month arrow
│   ├── upcoming.svg      # Upcoming section icon
│   ├── export.svg        # Export button icon
│   ├── close.svg         # Close button (modal)
│   ├── calendar-date.svg # Date picker icon
│   ├── location.svg      # Location icon (CreateEventModal)
│   ├── location2.svg     # Location icon (EventDetailModal, different design)
│   ├── clock.svg         # Time icon
│   ├── users.svg         # Attendees icon
│   ├── attendance.svg    # Attendance check icon
│   └── bell.svg          # Notification subscription icon
├── club-detail/          # Club Detail page only
│   ├── back-arrow.svg    # Back arrow
│   ├── users.svg         # Member count icon
│   ├── calendar-badge.svg # Founded year icon
│   ├── share.svg         # Share button
│   ├── subscribe.svg     # Subscribe button
│   ├── email-small.svg   # Email icon (leadership team)
│   ├── calendar.svg      # Regular schedule icon
│   ├── arrow-right.svg   # Arrow (View on Calendar)
│   ├── location.svg      # Location icon
│   ├── map.svg           # Campus map icon
│   ├── attendees.svg     # Attendees icon
│   ├── users-red.svg     # Member icon (Quick Info - red)
│   ├── clock-blue.svg    # Clock icon (Quick Info - blue)
│   ├── contact-green.svg # Contact icon (Quick Info - green)
│   ├── bell.svg          # Notification icon
│   └── email.svg         # Email icon (Subscribe)
├── clubs/                # Browse Clubs page only
│   ├── search.svg        # Search icon
│   ├── filter.svg        # Filter icon
│   ├── clock.svg         # Time/schedule icon
│   ├── location.svg      # Location icon
│   ├── users.svg         # Member count icon
│   ├── heart.svg         # Bookmark icon
│   └── share.svg         # Share icon
├── student-login/        # Student Login page only
│   ├── student-portal.svg # Student Portal icon
│   └── arrow.svg         # Sign In button arrow
└── welcome/              # Welcome page only
    ├── logo.svg          # Welcome page logo
    ├── student-icon.svg  # Student Access icon
    ├── admin-icon.svg    # Admin Access icon
    ├── arrow.svg         # Access Card button arrow
    ├── club-discovery.svg     # Club Discovery icon
    ├── calendar.svg      # Event Calendar icon
    └── ai-recommendations.svg # AI Recommendations icon
```

---

## 🔄 Shared Icons (Reused Across Pages)

### 1. **logo.svg** - Logo
- **Path**: `/images/icons/logo.svg`
- **Used in**:
  - `/student/home` - Header component (top left)
  - Reusable in all Student page headers
- **Size**: 24x24px (header standard)
- **Component**: `src/app/student/home/components/Header.tsx`

### 2. **bell.svg** - Notification
- **Path**: `/images/icons/bell.svg`
- **Used in**:
  - `/student/home` - Header component (top right action bar)
  - `/student/home/ai-recommendations` - Header
  - Notification button on all Student pages
- **Size**: 24x24px
- **Feature**: Used with notification dot
- **Components**:
  - `src/app/student/home/components/Header.tsx`
  - `src/app/student/home/ai-recommendations/page.tsx`

### 3. **profile.svg** - Profile/User
- **Path**: `/images/icons/profile.svg`
- **Used in**:
  - `/student/home` - Header component (top right profile button)
  - `/student/home/ai-recommendations` - Header
  - Profile button on all Student pages
- **Size**: 32x32px (profile button)
- **Components**:
  - `src/app/student/home/components/Header.tsx`
  - `src/app/student/home/ai-recommendations/page.tsx`

### 4. **search.svg** - Search
- **Path**: `/images/icons/search.svg`
- **Used in**:
  - `/student/home` - Header component (top right action bar)
  - All pages with search functionality
- **Size**: 24x24px
- **Component**: `src/app/student/home/components/Header.tsx`

### 5. **arrow-right.svg** - Arrow
- **Path**: `/images/icons/arrow-right.svg`
- **Used in**:
  - `/student/home` - HeroSection (Explore Clubs button)
  - `/student/home` - FeaturedClubs (View All button)
  - All "more", "navigate" buttons
- **Size**: 20x20px
- **Components**:
  - `src/app/student/home/components/HeroSection.tsx`
  - `src/app/student/home/components/FeaturedClubs.tsx`

### 6. **sparkles.svg** - AI/Special Features
- **Path**: `/images/icons/sparkles.svg`
- **Used in**:
  - `/student/home` - HeroSection (Get AI Recommendations button)
  - AI-related feature indicators
- **Size**: 20x20px
- **Component**: `src/app/student/home/components/HeroSection.tsx`

### 7. **clock.svg** - Time/Schedule
- **Path**: `/images/icons/clock.svg`
- **Used in**:
  - `/student/home` - ClubCard (club schedule display)
  - Schedule-related metadata
- **Size**: 16x16px
- **Color**: rgba(255, 255, 255, 0.8)
- **Component**: `src/app/student/home/components/ClubCard.tsx`

### 8. **users.svg** - Member Count
- **Path**: `/images/icons/users.svg`
- **Used in**:
  - `/student/home` - ClubCard (member count display)
  - Membership-related metadata
- **Size**: 16x16px
- **Color**: rgba(255, 255, 255, 0.8)
- **Component**: `src/app/student/home/components/ClubCard.tsx`

---

## 🎯 Page-Specific Icons

### Student Login Page (`/student/login`)

#### 16. **student-login/student-portal.svg**
- **Path**: `/images/icons/student-login/student-portal.svg`
- **Used in**: InfoPanel (left panel main icon)
- **Size**: 64x64px
- **Component**: `src/app/student/login/components/InfoPanel.tsx`

#### 17. **student-login/arrow.svg**
- **Path**: `/images/icons/student-login/arrow.svg`
- **Used in**: LoginForm - Sign In button
- **Size**: 20x20px
- **Component**: `src/app/student/login/components/LoginForm.tsx`

### Welcome Page (`/welcome`)

#### 18. **welcome/logo.svg**
- **Path**: `/images/icons/welcome/logo.svg`
- **Used in**: Logo component (top center)
- **Size**: 48x48px
- **Component**: `src/app/welcome/components/Logo.tsx`

#### 19–24. **welcome/** icons
- `student-icon.svg` - Student Access Card (48x48px)
- `admin-icon.svg` - Admin Access Card (48x48px)
- `arrow.svg` - Access Card buttons (20x20px)
- `club-discovery.svg` - Platform Features (32x32px)
- `calendar.svg` - Platform Features (32x32px)
- `ai-recommendations.svg` - Platform Features (32x32px)

### AI Recommendations Page (`/student/home/ai-recommendations`)

#### 9–15. **ai/** icons
- `logo.svg` - Page header logo (**different design** from shared logo)
- `star.svg` - AI banner main icon (40x40px)
- `target.svg` - Personalized Matches feature (24x24px)
- `clock.svg` - Schedule-Friendly feature (**different design**, 24x24px)
- `bolt.svg` - Instant Results feature (24x24px)
- `assistant.svg` - Chat header assistant info (32x32px)
- `ai-avatar.svg` - AI message avatar (40x40px)

### Browse Clubs Page (`/student/home/clubs`)

#### 25–31. **clubs/** icons
- `search.svg` - Search bar (20x20px)
- `filter.svg` - Filter button (20x20px)
- `clock.svg` - Meeting time metadata (16x16px)
- `location.svg` - Meeting location metadata (16x16px)
- `users.svg` - Member count metadata (16x16px)
- `heart.svg` - Bookmark button (20x20px)
- `share.svg` - Share button (20x20px)

#### ⚠️ **chevron.svg** - Dropdown Arrow (not saved)
- **Status**: Not saved → **Replaced with CSS**
- **Implementation**: Triangle arrow via `::after` pseudo-element in `FilterSection.module.css`

### Calendar Page (`/student/home/calendar`)

#### 32–47. **calendar/** icons
- `view-mode.svg` - Left sidebar View Mode header (20x20px)
- `month-view.svg` - Month View button (16x16px)
- `week-view.svg` - Week View button (16x16px)
- `create.svg` - Create button and modal header (20x20px, 24x24px)
- `arrow-left.svg` - Previous month navigation (24x24px)
- `arrow-right.svg` - Next month navigation (24x24px)
- `upcoming.svg` - "Upcoming This Week" section header (24x24px)
- `export.svg` - Export Calendar button (20x20px)
- `close.svg` - Modal close buttons (20x20px)
- `calendar-date.svg` - Date input icon in CreateEventModal (16x16px)
- `location.svg` - Location input icon in CreateEventModal (20x20px)
- `location2.svg` - Location info icon in EventDetailModal (**different design**, 20x20px)
- `clock.svg` - Time info icon in EventDetailModal (20x20px)
- `users.svg` - Attendees info icon in EventDetailModal (20x20px)
- `attendance.svg` - "Your Attendance" section header (20x20px)
- `bell.svg` - "Subscribe to Updates" button (20x20px)

### Club Detail Page (`/student/home/clubs/[id]`)

#### 48–63. **club-detail/** icons
- `back-arrow.svg` - Back to Browse button (16x16px)
- `users.svg` - Hero Quick Meta member count (20x20px)
- `calendar-badge.svg` - Hero Quick Meta founded year (20x20px)
- `share.svg` - Hero Share button (20x20px)
- `subscribe.svg` - Hero Subscribe button (20x20px)
- `email-small.svg` - Leadership team email (12x12px)
- `calendar.svg` - Meeting Information Regular Schedule card (20x20px)
- `arrow-right.svg` - View on Calendar button (16x16px)
- `location.svg` - Meeting Information location (20x20px)
- `map.svg` - View on Campus Map button (16x16px)
- `attendees.svg` - Past Activities attendee count (16x16px)
- `users-red.svg` - Sidebar Quick Info member count (**different design**, 20x20px)
- `clock-blue.svg` - Sidebar Quick Info founded year (20x20px)
- `contact-green.svg` - Sidebar Quick Info contact (20x20px)
- `bell.svg` - Get Updates header (20x20px)
- `email.svg` - Subscribe to Updates button (16x16px)

---

## 📋 Reuse Guide

### Checklist for New Page Development

1. **Header/Navigation**
   - ✅ Logo: `/images/icons/logo.svg`
   - ✅ Notifications: `/images/icons/bell.svg`
   - ✅ Profile: `/images/icons/profile.svg`
   - ✅ Search: `/images/icons/search.svg`

2. **Buttons/CTAs**
   - ✅ Arrow (Next/More): `/images/icons/arrow-right.svg`
   - ✅ AI Features: `/images/icons/sparkles.svg`

3. **Metadata Display**
   - ✅ Time/Schedule: `/images/icons/clock.svg`
   - ✅ Members/Users: `/images/icons/users.svg`

4. **When new icons are needed**
   - Check the icon UUID for that page in Figma
   - Compare with existing icon UUIDs
   - Different UUID = different design → new file needed
   - Page-specific: create `/images/icons/[page-name]/` folder
   - Shared across pages: save to `/images/icons/`

---

## ⚠️ Notes

### Icons with the same name may have different designs!

- **Example**: `logo.svg`
  - Shared: `/images/icons/logo.svg`
  - AI page: `/images/icons/ai/logo.svg` ← **different design**

- **Example**: `clock.svg`
  - Shared (club card): `/images/icons/clock.svg`
  - AI page (Features Grid): `/images/icons/ai/clock.svg` ← **different design**

### How to verify
1. Compare UUIDs from Figma URLs
2. Different UUID = different design
3. For color adjustments: use CSS filter or modify SVG

---

## 🔧 Pending Items

### Welcome Page local conversion ✅
- [x] Logo ✅
- [x] Student Access icon ✅
- [x] Admin Access icon ✅
- [x] Arrow (button) ✅
- [x] Feature Card icons (3) ✅

### Student Login Page local conversion (partial)
- [x] Student Portal icon ✅
- [x] Sign In button arrow ✅
- [ ] Modal icons (deferred pending redesign)
  - close.svg
  - info.svg
  - check.svg
  - send.svg

### Browse Clubs Page local conversion ✅
- [x] Search icon ✅
- [x] Filter icon ✅
- [x] Clock icon ✅
- [x] Location icon ✅
- [x] Member count icon ✅
- [x] Heart (bookmark) ✅
- [x] Share icon ✅
- [x] Shared icons reuse (logo, profile, search) ✅
- [ ] Chevron icon (replaced with CSS)

### Calendar Page local conversion ✅
All 16 icons converted and documented.

### Club Detail Page local conversion ✅
All 16 icons converted and documented. Comment section icons retained as Figma URLs (section planned for removal).

---

## 📝 Update Log

- **2026-01-31**: Initial document created
  - Student Home page icons (8) documented
  - AI Recommendations page icons (7) documented
  - Welcome Page pending items recorded

- **2026-01-31**: Welcome Page local conversion complete
  - 7 Welcome page icons added
  - All Figma URLs changed to local paths
  - Total 22 icons documented

- **2026-01-31**: Student Login Page partial local conversion
  - 2 icons added (InfoPanel, LoginForm)
  - Modal icons deferred
  - Total 24 icons documented

- **2026-01-31**: Browse Clubs Page local conversion complete
  - clubs/ folder created, 7 icons added
  - 3 shared icons reused (logo, profile, header-search)
  - Chevron icon replaced with CSS
  - Total 31 icons documented

- **2026-01-31**: Calendar Page local conversion complete
  - calendar/ folder created, 16 icons added
  - 3 shared icons reused (logo, search, profile)
  - 2 location icon variants (CreateEventModal, EventDetailModal)
  - Total 47 icons documented

- **2026-01-31**: Club Detail Page local conversion complete
  - club-detail/ folder created, 16 icons added
  - 1 shared icon reused (logo)
  - All inline SVGs replaced with local icons
  - Total 63 icons documented

---

## 💡 Tips

### Change icon color with CSS
```css
.icon {
  filter: brightness(0) saturate(100%) invert(100%); /* white */
  opacity: 0.8;
}
```

### Direct SVG color modification
```xml
<svg>
  <path fill="#FFFFFF" ... />
</svg>
```

### Using Next.js Image component
```tsx
import Image from 'next/image';

<Image
  src="/images/icons/logo.svg"
  alt="Logo"
  width={24}
  height={24}
/>
```
