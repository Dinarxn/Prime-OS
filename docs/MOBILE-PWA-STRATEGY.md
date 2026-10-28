# Prime OS — Mobile & PWA Strategy

## 1. Mobile-First Principles
Prime OS is designed with a strict mobile-first engineering discipline. Sales representatives operate in the field and between calls; the mobile interface must be as capable, ergonomic, and fast as the desktop view.

### A. Viewport Constraints
- **360px Minimum Viewport**: All layouts, cards, and modal components must render without horizontal scrolling down to a 360px viewport width (e.g., iPhone SE, Galaxy S8/S9).
- **CSS Constraint**: `overflow-x: hidden` applied globally to main content containers; data tables on desktop convert to flexible stacked cards on mobile.

### B. Touch Targets & Ergonomics
- **44x44px Minimum Touch Target**: Every interactive element (buttons, tabs, inputs, icon toggles) adheres to WCAG 2.5.5 and Apple HIG touch guidelines (minimum 44x44px hit area).
- **8px Target Spacing**: Adjacent interactive controls have at least 8px separation to prevent accidental taps.
- **Thumb-Zone Hierarchy**:
  - *Bottom 40% (Green Zone)*: High-frequency actions — Call, WhatsApp, bottom navigation tabs, outcome submit buttons.
  - *Middle 30% (Yellow Zone)*: Scrollable content, lead profiles, notes, objection scripts.
  - *Top 30% (Red Zone)*: Infrequent/destructive actions — Delete lead, search bar trigger, workspace switch.

### C. iOS Safari Guardrails
- **16px Input Font-Size Rule**: Form inputs, textareas, and selects must have an effective font-size of at least 16px (`text-base` or `text-[16px] md:text-sm`). Font sizes below 16px trigger automatic viewport zoom in iOS Safari, corrupting the layout.
- **Safe-Area Inset Tokens**:
  - Viewport meta must declare `viewport-fit=cover`.
  - Headers incorporate `pt-[env(safe-area-inset-top)]`.
  - Bottom navigation incorporates `pb-[env(safe-area-inset-bottom)]`.

---

## 2. Navigation Architecture: The Dual-Shell Pattern
The interface branches cleanly at the `md:` breakpoint (768px):

| Feature | Mobile (`< 768px`) | Desktop (`>= 768px`) |
| :--- | :--- | :--- |
| **Primary Navigation** | Fixed Bottom Navigation Bar (5 tabs) | Persistent Left Sidebar (expanded / rail) |
| **Header** | Compact 56px top bar with brand & search trigger | Integrated top action bar with breadcrumbs & user profile |
| **Lead List Display** | Compact touch-friendly Lead Cards | High-density sortable data table with bulk actions |
| **Dialogs / Modals** | Touch-draggable Bottom Sheets | Centered modal dialogs or slide-over inspector panels |

---

## 3. PWA Strategy & Capability Boundaries

### A. Supported Web & PWA Capabilities
1. **1-Tap Phone Launch**: Triggering `<a href="tel:+1234567890">` invokes the operating system's native phone dialer directly.
2. **1-Tap WhatsApp Thread**: Triggering `<a href="https://wa.me/1234567890?text=...">` opens WhatsApp natively with pre-filled pitch copy.
3. **1-Tap SMS Compose**: Triggering `<a href="sms:+1234567890?body=...">` invokes the device SMS application.
4. **Script Clipboard Copy**: Using `navigator.clipboard.writeText` enables instant copying of cold outreach pitch scripts.
5. **Installability**: Using a verified web app manifest (`manifest.json`), Prime OS can be added to the mobile home screen or desktop dock in `standalone` display mode.

### B. Explicit Browser Sandboxing Boundaries
To maintain technical integrity, we explicitly acknowledge browser sandboxing constraints:
- **No Native Call Recording**: A web application or PWA cannot tap into cellular audio streams or record phone calls made via the native dialer.
- **No Background Call State Sniffing**: The browser cannot detect when an external cellular phone call starts or ends.
- **No Silent Background SMS**: Web applications cannot silently dispatch SMS or intercept incoming cellular SMS without user interaction.

### C. The "Return-to-App" Call Outcome Logging Pattern
To provide native-like speed without violating browser sandboxing:
1. When the user taps the **Call** button, Prime OS triggers `tel:` and attaches a one-time `visibilitychange` listener.
2. As the native dialer opens, the browser becomes hidden (`document.visibilityState === 'hidden'`).
3. When the sales rep hangs up and returns to Prime OS (`document.visibilityState === 'visible'`), a bottom sheet automatically slides up: **"Log Call Outcome"**.
4. The rep taps the outcome (`Connected`, `Left Voicemail`, `Gatekeeper`, `No Answer`) with one thumb tap, logging the touch in under 2 seconds.

---

## 4. Manifest & Icon Verification
- **Manifest Path**: `public/manifest.json`
- **Display Mode**: `standalone`
- **Theme Color**: `#09090b` (zinc-950)
- **Background Color**: `#09090b`
- **Verified Icon Assets**: All declared icons (`public/icons/icon.svg`, `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/icons/apple-touch-icon.png`) must be valid, existing files with non-zero byte size. No 404 placeholder references are permitted.

