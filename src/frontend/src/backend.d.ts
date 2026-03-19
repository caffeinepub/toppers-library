import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Seat {
    id: bigint;
    isAvailable: boolean;
    roomId: bigint;
    seatType: string;
    seatNumber: string;
}
export interface Message {
    id: bigint;
    content: string;
    bookingId: bigint;
    timestamp: bigint;
}
export interface Room {
    id: bigint;
    isAC: boolean;
    name: string;
    description: string;
    capacity: bigint;
    condition: string;
}
export interface BookingResult {
    studentId: string;
    bookingId: bigint;
    password: string;
}
export interface Booking {
    id: bigint;
    status: string;
    paymentStatus: string;
    studentName: string;
    expiryDate: string;
    upiTransactionId: string;
    seatId: bigint;
    bookingDuration: string;
    bookingDate: string;
    studentContact: string;
    roomId: bigint;
    amount: bigint;
    timeSlot: string;
}
export interface UserProfile {
    name: string;
}
export interface backendInterface {
    _initialize(): Promise<void>;
    approveBooking(id: bigint): Promise<Booking>;
    cancelBooking(id: bigint): Promise<Booking>;
    createBooking(seatId: bigint, studentName: string, studentContact: string, bookingDate: string, expiryDate: string, timeSlot: string, bookingDuration: string, upiTransactionId: string, amount: bigint): Promise<BookingResult>;
    deleteBooking(id: bigint): Promise<boolean>;
    expireOldBookings(currentDate: string): Promise<bigint>;
    getBookedSeatIds(date: string, timeSlot: string): Promise<Array<bigint>>;
    getBookedSeatIdsByRoom(roomId: bigint): Promise<Array<bigint>>;
    getBookingByCredentials(studentId: string, password: string): Promise<Booking | null>;
    getBookings(): Promise<Array<Booking>>;
    getBookingsByDate(date: string): Promise<Array<Booking>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getMessageByCredentials(studentId: string, password: string): Promise<Message | null>;
    getMessagesByBooking(bookingId: bigint): Promise<Array<Message>>;
    getRooms(): Promise<Array<Room>>;
    getSeat(id: bigint): Promise<Seat>;
    getSeatsByRoom(roomId: bigint): Promise<Array<Seat>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isSeatAvailable(seatId: bigint, date: string, timeSlot: string): Promise<boolean>;
    rebookSeat(studentId: string, password: string, newBookingDate: string, newExpiryDate: string, newUpiTransactionId: string): Promise<BookingResult>;
    rejectBooking(id: bigint): Promise<Booking>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(bookingId: bigint, content: string, timestamp: bigint): Promise<Message>;
    updateBookingPayment(id: bigint, upiTransactionId: string): Promise<Booking>;
    updateSeatAvailability(id: bigint, isAvailable: boolean): Promise<Seat>;
}
