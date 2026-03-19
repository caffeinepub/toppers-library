import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Booking {
    id: bigint;
    status: string;
    paymentStatus: string;
    studentName: string;
    upiTransactionId: string;
    seatId: bigint;
    bookingDuration: string;
    bookingDate: string;
    studentContact: string;
    roomId: bigint;
    amount: bigint;
    timeSlot: string;
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
export interface Seat {
    id: bigint;
    isAvailable: boolean;
    roomId: bigint;
    seatType: string;
    seatNumber: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approveBooking(id: bigint): Promise<Booking>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelBooking(id: bigint): Promise<Booking>;
    createBooking(seatId: bigint, studentName: string, studentContact: string, bookingDate: string, timeSlot: string, bookingDuration: string, upiTransactionId: string, amount: bigint): Promise<BookingResult>;
    getBookedSeatIds(date: string, timeSlot: string): Promise<Array<bigint>>;
    getBookingByCredentials(studentId: string, password: string): Promise<Booking | null>;
    getBookings(): Promise<Array<Booking>>;
    getBookingsByDate(date: string): Promise<Array<Booking>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getRooms(): Promise<Array<Room>>;
    getSeat(id: bigint): Promise<Seat>;
    getSeatsByRoom(roomId: bigint): Promise<Array<Seat>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isSeatAvailable(seatId: bigint, date: string, timeSlot: string): Promise<boolean>;
    rejectBooking(id: bigint): Promise<Booking>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateBookingPayment(id: bigint, upiTransactionId: string): Promise<Booking>;
    updateSeatAvailability(id: bigint, isAvailable: boolean): Promise<Seat>;
}
