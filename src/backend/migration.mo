import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  // ── Old types (previously deployed) ──────────────────────────────────────

  type UserRole = { #admin; #user; #guest };

  type AccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, UserRole>;
  };

  type OldBooking = {
    id : Nat;
    seatId : Nat;
    roomId : Nat;
    studentName : Text;
    studentContact : Text;
    bookingDate : Text;
    timeSlot : Text;
    bookingDuration : Text;
    status : Text;
    upiTransactionId : Text;
    paymentStatus : Text;
    amount : Nat;
  };

  type Room = {
    id : Nat;
    name : Text;
    description : Text;
    isAC : Bool;
    capacity : Nat;
    condition : Text;
  };

  type Seat = {
    id : Nat;
    roomId : Nat;
    seatNumber : Text;
    seatType : Text;
    isAvailable : Bool;
  };

  type StudentCredential = {
    bookingId : Nat;
    studentId : Text;
    password : Text;
  };

  type UserProfile = { name : Text };

  type OldActor = {
    rooms : Map.Map<Nat, Room>;
    seats : Map.Map<Nat, Seat>;
    bookings : Map.Map<Nat, OldBooking>;
    userProfiles : Map.Map<Principal, UserProfile>;
    credentials : Map.Map<Text, StudentCredential>;
    bookingOwners : Map.Map<Nat, Principal>;
    accessControlState : AccessControlState;
    roomIdCounter : Nat;
    seatIdCounter : Nat;
    bookingIdCounter : Nat;
  };

  // ── New types (current version) ───────────────────────────────────────────

  type NewBooking = {
    id : Nat;
    seatId : Nat;
    roomId : Nat;
    studentName : Text;
    studentContact : Text;
    bookingDate : Text;
    expiryDate : Text;
    timeSlot : Text;
    bookingDuration : Text;
    status : Text;
    upiTransactionId : Text;
    paymentStatus : Text;
    amount : Nat;
  };

  type Message = {
    id : Nat;
    bookingId : Nat;
    content : Text;
    timestamp : Int;
  };

  type NewActor = {
    rooms : Map.Map<Nat, Room>;
    seats : Map.Map<Nat, Seat>;
    bookings : Map.Map<Nat, NewBooking>;
    userProfiles : Map.Map<Principal, UserProfile>;
    credentials : Map.Map<Text, StudentCredential>;
    messages : Map.Map<Nat, Message>;
    roomIdCounter : Nat;
    seatIdCounter : Nat;
    bookingIdCounter : Nat;
    messageIdCounter : Nat;
  };

  // ── Migration function ────────────────────────────────────────────────────

  public func run(old : OldActor) : NewActor {
    // Migrate bookings: add expiryDate (empty string for existing bookings)
    let newBookings = Map.empty<Nat, NewBooking>();
    for ((k, b) in old.bookings.entries()) {
      let nb : NewBooking = {
        id = b.id;
        seatId = b.seatId;
        roomId = b.roomId;
        studentName = b.studentName;
        studentContact = b.studentContact;
        bookingDate = b.bookingDate;
        expiryDate = "";
        timeSlot = b.timeSlot;
        bookingDuration = b.bookingDuration;
        status = b.status;
        upiTransactionId = b.upiTransactionId;
        paymentStatus = b.paymentStatus;
        amount = b.amount;
      };
      newBookings.add(k, nb);
    };

    {
      rooms = old.rooms;
      seats = old.seats;
      bookings = newBookings;
      userProfiles = old.userProfiles;
      credentials = old.credentials;
      messages = Map.empty<Nat, Message>();
      roomIdCounter = old.roomIdCounter;
      seatIdCounter = old.seatIdCounter;
      bookingIdCounter = old.bookingIdCounter;
      messageIdCounter = 1;
    };
  };
};
