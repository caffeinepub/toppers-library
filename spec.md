# Toppers Library

## Current State
Bookings have no expiry date. Seats stay occupied indefinitely once approved. Students have no way to renew/rebook from the Student Login page.

## Requested Changes (Diff)

### Add
- `expiryDate` field to Booking (set to bookingDate + 30 days on creation)
- `rebookSeat` backend function: creates a new booking for the same seat for another 30 days, generates new credentials
- Expiry warning on Student Login page: yellow/orange notice when booking expires in 5 days or less
- "Rebook" button on Student Login page so student can renew the same seat for another month
- Auto-expire: when fetching seats, if a booking's expiryDate has passed and status is approved, the seat is freed

### Modify
- `createBooking`: compute and store expiryDate (bookingDate + 30 days)
- `getBookedSeatIds` / `isSeatAvailable`: exclude expired bookings
- Student Login page: show expiry date, warning banner, and Rebook button
- Admin Bookings tab: show expiry date column

### Remove
- Nothing removed

## Implementation Plan
1. Update Booking type to include `expiryDate: Text`
2. Update `createBooking` to compute expiryDate
3. Add `rebookSeat(bookingId, newTransactionId)` function -- creates a new booking with same seat/student/plan, new expiryDate
4. Add `expireOldBookings()` utility called in `getSeatsByRoom` and `getBookedSeatIds` to free seats with passed expiryDate
5. Frontend: Student Login page shows expiry date per booking, yellow warning if <= 5 days, Rebook button that opens a payment flow for the same seat/plan
6. Admin Bookings table: add Expiry Date column
