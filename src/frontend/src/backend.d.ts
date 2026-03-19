import type { Principal } from "@icp-sdk/core/principal";

export interface Room {
  id: bigint;
  name: string;
  description: string;
  isAC: boolean;
  capacity: bigint;
  condition: string;
}

export interface Seat {
  id: bigint;
  roomId: bigint;
  seatNumber: string;
  seatType: string;
  isAvailable: boolean;
}

export interface Booking {
  id: bigint;
  seatId: bigint;
  roomId: bigint;
  studentName: string;
  studentContact: string;
  bookingDate: string;
  expiryDate: string;
  timeSlot: string;
  bookingDuration: string;
  status: string;
  upiTransactionId: string;
  paymentStatus: string;
  amount: bigint;
}

export interface BookingResult {
  bookingId: bigint;
  studentId: string;
  password: string;
}

export interface Message {
  id: bigint;
  bookingId: bigint;
  content: string;
  timestamp: bigint;
}

export interface UserProfile {
  name: string;
}

export interface backendInterface {
  _initialize(): Promise<void>;
  getRooms(): Promise<Array<Room>>;
  getSeats(): Promise<Array<Seat>>;
  getSeatsByRoom(roomId: bigint): Promise<Array<Seat>>;
  getSeat(id: bigint): Promise<Seat>;
  updateSeatAvailability(id: bigint, isAvailable: boolean): Promise<Seat>;
  createBooking(
    seatId: bigint,
    studentName: string,
    studentContact: string,
    bookingDate: string,
    expiryDate: string,
    timeSlot: string,
    bookingDuration: string,
    upiTransactionId: string,
    amount: bigint
  ): Promise<BookingResult>;
  getBookings(): Promise<Array<Booking>>;
  getBookingsByDate(date: string): Promise<Array<Booking>>;
  getBookedSeatIds(date: string, timeSlot: string): Promise<Array<bigint>>;
  getBookedSeatIdsByRoom(roomId: bigint): Promise<Array<bigint>>;
  getBookingByCredentials(studentId: string, password: string): Promise<Booking | null>;
  approveBooking(id: bigint): Promise<Booking>;
  rejectBooking(id: bigint): Promise<Booking>;
  deleteBooking(id: bigint): Promise<boolean>;
  cancelBooking(id: bigint): Promise<Booking>;
  updateBookingPayment(id: bigint, upiTransactionId: string): Promise<Booking>;
  sendMessage(bookingId: bigint, content: string, timestamp: bigint): Promise<Message>;
  getMessageByCredentials(studentId: string, password: string): Promise<Message | null>;
  getMessagesByBooking(bookingId: bigint): Promise<Array<Message>>;
  rebookSeat(
    studentId: string,
    password: string,
    newBookingDate: string,
    newExpiryDate: string,
    newUpiTransactionId: string
  ): Promise<BookingResult>;
  expireOldBookings(currentDate: string): Promise<bigint>;
  getCallerUserProfile(): Promise<UserProfile | null>;
  getUserProfile(user: Principal): Promise<UserProfile | null>;
  saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
