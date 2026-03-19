# Toppers Library

## Current State
- StudentLoginPage at /student-login: login form (Student ID + password), fetches booking by credentials, shows booking details.
- AdminPage at /admin: full 5-tab dashboard with its own login.
- Navbar has a Student Login link. No public Admin Login link.

## Requested Changes (Diff)

### Add
- New /admin-login route with AdminLoginPage component.
- AdminLoginPage: same form/card style as StudentLoginPage. Username + password fields. Credentials validated client-side: addmin / topperslibrary739. On success, shows All Bookings view with every booking from the backend.
- Admin Login button in Navbar, styled same as Student Login (ShieldCheck icon + label).

### Modify
- Navbar: add Admin Login link (with ShieldCheck icon), styled identically to Student Login link.
- App.tsx: add adminLoginRoute for /admin-login.

### Remove
- Nothing.

## Implementation Plan
1. Create src/frontend/src/pages/AdminLoginPage.tsx with login form and all-bookings view after auth.
2. Add /admin-login route to App.tsx.
3. Add Admin Login link to Navbar navLinks array.
