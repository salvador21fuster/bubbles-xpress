# Mr Bubbles Express - Design Guidelines

## Design Approach: Material Design System with Custom Branding

**Rationale**: Given the multi-surface operational platform with complex workflows, real-time tracking, and role-based interfaces, we're adopting Material Design principles for consistency, clarity, and efficiency. The system prioritizes usability and information hierarchy while maintaining brand personality through strategic color and typography choices.

**Key References**: Material Design 3, Uber Driver App (operational efficiency), Linear (clean data presentation)

---

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Primary: `210 100% 50%` (Vibrant blue - trust, cleanliness, reliability)
- Primary Container: `210 100% 95%` (Light blue backgrounds)
- Secondary: `180 60% 45%` (Teal - fresh, clean laundry association)
- Surface: `0 0% 100%` (Pure white)
- Surface Variant: `210 20% 97%` (Subtle gray backgrounds)
- Outline: `210 15% 85%` (Borders, dividers)
- Error: `0 85% 60%` (Alert states)
- Success: `145 65% 45%` (Completed states)
- Warning: `40 95% 55%` (Pending actions)

**Dark Mode:**
- Primary: `210 100% 65%` (Brighter blue for contrast)
- Primary Container: `210 80% 20%` (Deep blue containers)
- Secondary: `180 50% 55%` (Lighter teal)
- Surface: `210 15% 10%` (Very dark blue-gray)
- Surface Variant: `210 15% 15%` (Elevated surfaces)
- Outline: `210 10% 30%` (Dark mode borders)

**Semantic Status Colors:**
- In Transit: `210 100% 50%` (Primary blue)
- Processing: `280 60% 55%` (Purple)
- Completed: `145 65% 45%` (Green)
- Issue/Delayed: `0 85% 60%` (Red)

### B. Typography

**Font Stack:**
- Primary: 'Inter' via Google Fonts (Clean, modern, excellent readability)
- Monospace: 'JetBrains Mono' for order IDs, QR codes, technical data

**Scale & Weights:**
- Display: 2.5rem / 600 weight (Hero titles on public site)
- H1: 2rem / 600 (Page titles)
- H2: 1.5rem / 600 (Section headers)
- H3: 1.25rem / 600 (Card titles, subsections)
- Body: 1rem / 400 (Primary content)
- Body Small: 0.875rem / 400 (Captions, metadata)
- Label: 0.75rem / 500 (Form labels, uppercase)
- Technical: 0.875rem / 400 monospace (IDs, codes)

### C. Layout System

**Spacing Primitives**: Use Tailwind units of `2, 4, 6, 8, 12, 16, 20` for consistent rhythm
- Micro spacing: `2` (8px) - icon-to-text gaps
- Standard spacing: `4` (16px) - between related elements
- Section spacing: `8` (32px) - between distinct sections
- Large gaps: `12-20` (48-80px) - major layout divisions

**Grid System:**
- Mobile: Single column with 4-unit padding
- Tablet: 2-column adaptive layouts
- Desktop: 12-column grid, max-width container of 1280px

**Portal Layouts:**
- Shop/Admin: Sidebar navigation (240px fixed) + main content area
- Mobile Apps: Bottom tab navigation (56px height)
- Forms: Max-width 640px for optimal scanning

### D. Component Library

**Navigation:**
- Mobile: Bottom tabs with icons + labels, 4-5 primary sections
- Web Portals: Left sidebar with collapsible groups, active state indicators
- Top App Bar: Fixed with role badge, notifications, profile menu

**Order/Tracking Cards:**
- Compact List View: Status badge + order ID + timestamp + customer name
- Expanded Detail: Timeline component showing state progression with timestamps
- Map Integration: Full-width embedded map with live GPS markers

**Data Display:**
- Status Badges: Rounded pills with semantic colors, 12px padding
- State Timeline: Vertical stepper with icons, connecting lines, timestamps
- Metrics Dashboard: Grid of stat cards (4-column on desktop, 1-column mobile)
- Tables: Zebra striping, sticky headers, action menus on rows

**Forms & Inputs:**
- Material Design outlined inputs with floating labels
- Scan buttons: Large (56px height) with scanner icon, primary color
- Dark mode: All form inputs with proper contrast backgrounds (Surface Variant)
- Validation: Inline error messages below fields, error outline color

**Action Buttons:**
- Primary: Filled buttons for main actions (Scan, Confirm, Create)
- Secondary: Outlined buttons for alternatives
- Scan/Print Actions: Prominent FAB (Floating Action Button) in bottom-right
- Min touch target: 48px for mobile accessibility

**Modals & Overlays:**
- Sheet modals from bottom on mobile
- Centered dialogs on desktop
- Backdrop: `0 0% 0%` at 60% opacity
- Max-width: 480px for decision dialogs, 800px for forms

### E. Animations

**Purposeful Motion Only:**
- State transitions: Subtle 200ms ease-in-out color changes
- Sheet modals: Slide up animation 300ms
- Scan success: Brief checkmark animation (500ms)
- GPS marker: Pulse effect for active delivery
- Page transitions: 150ms fade (mobile apps)
- NO decorative animations - every motion serves a function

---

## Surface-Specific Guidelines

### Customer Mobile App
- Hero: Full-width order status card with live map when in transit
- Services selection: Grid of service cards with icons, pricing
- Photo upload: Gallery view with camera integration
- Receipt: Expandable accordion showing bag/item breakdown

### Driver Mobile App  
- Priority: Large scan button always accessible via FAB
- Job cards: Swipeable list with accept/decline actions
- Navigation: Integrated turn-by-turn directions
- Offline indicator: Persistent banner when disconnected

### Shop Portal (Web)
- Dashboard: Real-time queue of orders by state (AT_SHOP, PROCESSING, etc.)
- Intake flow: Large QR scanner viewport + weight input form side-by-side
- Subcontract modal: Shop selector with terms display
- Processing board: Kanban-style columns for WASH/DRY/PRESS states

### Admin Portal (Web - Owners Only)
- Security: MFA badge in header, session timeout indicator
- Transactions table: Filterable, sortable with inline split details
- User records: Searchable cards with activity timeline
- Analytics: Dashboard with time-range selectors, export buttons
- Charts: Line graphs for revenue, bar charts for volumes (using Chart.js)

### Public Site/Booking Widget
- Hero: Full-viewport image of clean laundry with overlay CTA
- Services showcase: 3-column grid on desktop with pricing cards
- How It Works: 4-step visual timeline with icons
- Driver/Franchise signup: Prominent dual CTAs with contrasting treatments
- Booking form: Embedded widget with service selector, address autocomplete

---

## Images

**Hero Image**: Use high-quality lifestyle photography of freshly laundered clothes, neatly folded or hanging, with soft natural lighting. Image should convey cleanliness, care, and professional service. Place in full-viewport hero section with dark gradient overlay for text legibility.

**Service Icons**: Custom illustrated icons for each service type (wash, dry clean, press, fold) in the primary blue color palette.

**Driver/Shop Photos**: Authentic photography showing drivers with labeled bags, shops with processing equipment - building trust through transparency.

**State Indicator Icons**: Consistent iconography for order states (package for pickup, truck for transit, washer for processing, checkmark for complete).