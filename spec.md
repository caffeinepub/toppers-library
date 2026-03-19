# Toppers Library

## Current State
- Seat booking app with Hall A (60 seats) and Hall B (20 seats)
- Monthly booking only: half day (₹600) or full day (₹1200)
- Payment via UPI QR code; admin manually approves bookings
- Admin dashboard at /admin with no login protection
- No student login or credential system

## Requested Changes (Diff)

### Add
- Admin login screen at /admin: username "addmin", password "topperslibrary739" (stored in frontend, no backend auth needed)
- Student credentials generated at booking creation: random Student ID (e.g. TL-XXXX) and random password
- Display credentials to student after payment step is submitted
- Student login page at /student-login where students enter their ID + password to view their booking details
- Backend: StudentCredential type {bookingId, studentId, password}; stored in a map keyed by bookingId
- Backend: createBooking now returns {bookingId, studentId, password}
- Backend: getBookingByCredentials(studentId, password) returns the booking if credentials match

### Modify
- createBooking return type changes from Nat to record {bookingId: Nat; studentId: Text; password: Text}
- After payment submission in SeatBookingPage, show a credential card with the student's ID and password
- Admin page shows login form before dashboard; session stored in localStorage

### Remove
- Nothing removed

## Implementation Plan
1. Update backend: add StudentCredential type, credentials map, credential generation in createBooking (return record), getBookingByCredentials query
2. Regenerate backend bindings
3. Update AdminPage: add login gate (username/password check in frontend, stored in localStorage)
4. Update SeatBookingPage: handle new createBooking return type, show credentials after payment step
5. Add StudentLoginPage at /student-login: form to enter studentId + password, show booking details on success
6. Add route for /student-login in App.tsx
