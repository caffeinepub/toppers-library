# Toppers Library

## Current State
The site has a light theme with black buttons, zinc-900 backgrounds, and amber accents. Pages (Rooms, SeatBooking) have plain layouts without hero sections. Navbar uses black buttons.

## Requested Changes (Diff)

### Add
- Full dark mode premium theme across all public pages (homepage, rooms, seat booking, student login)
- Hero mode layout on every page: full-width hero banner with background image/gradient at the top of each page
- Premium deep indigo/violet color palette replacing all black (#18181b / zinc-900) accent colors on buttons, cards, UI elements
- Gold/amber accent colors remain for highlights

### Modify
- Navbar: dark background, replace black buttons with deep indigo/violet buttons
- HomePage: hero already exists, enhance with dark mode; stats bar and sections use dark premium styling
- RoomsPage: add a hero banner at the top; cards redesigned for dark premium look
- SeatBookingPage: add a hero banner at top; seat grid and booking dialogs use dark premium styling
- StudentLoginPage: add a hero banner at top; form uses dark premium styling
- Footer: dark premium styling
- Text: body text uses appropriate light colors on dark backgrounds (white/zinc-100 on dark), dark text where background is light
- All bg-zinc-900/black buttons → bg-indigo-700 or bg-violet-800 with hover states
- Occupancy bar: replace zinc-900 fill with indigo/violet
- Plan toggle buttons in booking dialog: replace zinc-900 active state with indigo

### Remove
- Light/white background sections on public pages (replaced with dark equivalents)
- bg-zinc-50 / bg-white page backgrounds (replaced with dark slate/gray backgrounds)

## Implementation Plan
1. Update index.css / global styles for dark theme base
2. Rewrite Navbar with dark background and indigo/violet buttons
3. Rewrite HomePage with enhanced dark hero + dark section backgrounds
4. Rewrite RoomsPage with hero banner + dark premium cards
5. Rewrite SeatBookingPage with hero banner + dark seat grid + dark dialogs
6. Rewrite StudentLoginPage with hero banner + dark form
7. Update Footer with dark premium styling
8. All buttons and accents: indigo-700/violet-800 replacing zinc-900
