import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  module Room {
    public func compare(room1 : Room, room2 : Room) : Order.Order {
      Nat.compare(room1.id, room2.id);
    };
  };

  module Seat {
    public func compare(seat1 : Seat, seat2 : Seat) : Order.Order {
      Nat.compare(seat1.id, seat2.id);
    };
  };

  module Booking {
    public func compare(booking1 : Booking, booking2 : Booking) : Order.Order {
      Nat.compare(booking1.id, booking2.id);
    };
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

  type Booking = {
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

  type StudentCredential = {
    bookingId : Nat;
    studentId : Text;
    password : Text;
  };

  type BookingResult = {
    bookingId : Nat;
    studentId : Text;
    password : Text;
  };

  public type UserProfile = {
    name : Text;
  };

  let rooms = Map.empty<Nat, Room>();
  let seats = Map.empty<Nat, Seat>();
  let bookings = Map.empty<Nat, Booking>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let credentials = Map.empty<Text, StudentCredential>();
  let bookingOwners = Map.empty<Nat, Principal>();
  var roomIdCounter = 1;
  var seatIdCounter = 1;
  var bookingIdCounter = 1;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  func generateStudentId(bookingId : Nat) : Text {
    let n = (bookingId * 7919 + 1000) % 9000 + 1000;
    "TL-" # n.toText();
  };

  func generatePassword(bookingId : Nat) : Text {
    let chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let charsArray = chars.toArray();
    let n1 = bookingId % charsArray.size();
    let n2 = (bookingId * 3 + 5) % charsArray.size();
    let n3 = (bookingId * 7 + 11) % charsArray.size();
    let n4 = (bookingId * 13 + 17) % charsArray.size();
    let n5 = (bookingId * 19 + 23) % charsArray.size();
    let n6 = (bookingId * 29 + 31) % charsArray.size();

    Text.fromChar(charsArray[n1]) # Text.fromChar(charsArray[n2]) # Text.fromChar(charsArray[n3]) # Text.fromChar(charsArray[n4]) # Text.fromChar(charsArray[n5]) # Text.fromChar(charsArray[n6]);
  };

  let defaultRooms : [Room] = [
    {
      id = 1;
      name = "AC Hall A";
      description = "Large AC study hall with 60 premium chairs";
      isAC = true;
      capacity = 60;
      condition = "Excellent";
    },
    {
      id = 2;
      name = "AC Hall B";
      description = "Cozy AC study hall with 20 premium chairs";
      isAC = true;
      capacity = 20;
      condition = "Excellent";
    },
  ];

  public shared ({ caller }) func _initialize() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can initialize the system");
    };
    if (rooms.isEmpty() and seats.isEmpty()) {
      for (room in defaultRooms.values()) {
        rooms.add(room.id, room);
        var seatNum = 1;
        while (seatNum <= room.capacity) {
          let seat : Seat = {
            id = seatIdCounter;
            roomId = room.id;
            seatNumber = "S" # seatNum.toText();
            seatType = "chair";
            isAvailable = true;
          };
          seats.add(seat.id, seat);
          seatIdCounter += 1;
          seatNum += 1;
        };
        roomIdCounter += 1;
      };
    };
  };

  // User profiles
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Cannot access other user's profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save their profile");
    };
    userProfiles.add(caller, profile);
  };

  // Bookings functions (open access for creation - students can book as guests)
  public shared ({ caller }) func createBooking(seatId : Nat, studentName : Text, studentContact : Text, bookingDate : Text, timeSlot : Text, bookingDuration : Text, upiTransactionId : Text, amount : Nat) : async BookingResult {
    switch (seats.get(seatId)) {
      case (null) { Runtime.trap("Seat not found") };
      case (?seat) {
        let newBooking : Booking = {
          id = bookingIdCounter;
          seatId;
          roomId = seat.roomId;
          studentName;
          studentContact;
          bookingDate;
          timeSlot;
          bookingDuration;
          status = "pending";
          upiTransactionId;
          paymentStatus = "pending";
          amount;
        };
        bookings.add(bookingIdCounter, newBooking);
        bookingOwners.add(bookingIdCounter, caller);

        // Generate credentials using computed studentId and password
        let sid = generateStudentId(bookingIdCounter);
        let pwd = generatePassword(bookingIdCounter);
        let cred : StudentCredential = {
          bookingId = bookingIdCounter;
          studentId = sid;
          password = pwd;
        };
        credentials.add(sid, cred);
        let result : BookingResult = {
          bookingId = bookingIdCounter;
          studentId = sid;
          password = pwd;
        };
        bookingIdCounter += 1;
        result;
      };
    };
  };

  public query ({ caller }) func getRooms() : async [Room] {
    rooms.values().toArray().sort();
  };

  // Update seat's availability in the future (not used currently)
  public shared ({ caller }) func updateSeatAvailability(id : Nat, isAvailable : Bool) : async Seat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update seat availability");
    };

    switch (seats.get(id)) {
      case (null) { Runtime.trap("Seat not found") };
      case (?seat) {
        let updatedSeat : Seat = {
          id = seat.id;
          roomId = seat.roomId;
          seatNumber = seat.seatNumber;
          seatType = seat.seatType;
          isAvailable;
        };
        seats.add(id, updatedSeat);
        updatedSeat;
      };
    };
  };

  public query ({ caller }) func getSeatsByRoom(roomId : Nat) : async [Seat] {
    seats.values().toArray().filter(func(seat) { seat.roomId == roomId });
  };

  public query ({ caller }) func getSeat(id : Nat) : async Seat {
    switch (seats.get(id)) {
      case (null) { Runtime.trap("Seat not found") };
      case (?seat) { seat };
    };
  };

  public query ({ caller }) func isSeatAvailable(seatId : Nat, date : Text, timeSlot : Text) : async Bool {
    switch (seats.get(seatId)) {
      case (null) { Runtime.trap("Seat not found") };
      case (?_) {
        let conflicts = bookings.values().toArray().filter(func(b) {
          b.seatId == seatId and b.bookingDate == date and b.timeSlot == timeSlot and (b.status == "pending" or b.status == "approved")
        });
        conflicts.isEmpty();
      };
    };
  };

  public query ({ caller }) func getBookedSeatIds(date : Text, timeSlot : Text) : async [Nat] {
    bookings.values().toArray()
      .filter(func(b) { b.bookingDate == date and b.timeSlot == timeSlot and (b.status == "pending" or b.status == "approved") })
      .map(func(b) { b.seatId });
  };

  // Student login - get booking by credentials
  public query ({ caller }) func getBookingByCredentials(studentId : Text, password : Text) : async ?Booking {
    switch (credentials.get(studentId)) {
      case (null) { null };
      case (?cred) {
        if (cred.password == password) {
          bookings.get(cred.bookingId);
        } else { null };
      };
    };
  };

  public shared ({ caller }) func updateBookingPayment(id : Nat, upiTransactionId : Text) : async Booking {
    // Only the booking owner or admin can update payment
    switch (bookingOwners.get(id)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?owner) {
        if (caller != owner and not (AccessControl.isAdmin(accessControlState, caller))) {
          Runtime.trap("Unauthorized: Only the booking owner or admin can update payment");
        };
      };
    };

    switch (bookings.get(id)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) {
        let updatedBooking : Booking = {
          id = booking.id;
          seatId = booking.seatId;
          roomId = booking.roomId;
          studentName = booking.studentName;
          studentContact = booking.studentContact;
          bookingDate = booking.bookingDate;
          timeSlot = booking.timeSlot;
          bookingDuration = booking.bookingDuration;
          status = booking.status;
          upiTransactionId;
          paymentStatus = "submitted";
          amount = booking.amount;
        };
        bookings.add(id, updatedBooking);
        updatedBooking;
      };
    };
  };

  public shared ({ caller }) func approveBooking(id : Nat) : async Booking {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve bookings");
    };
    switch (bookings.get(id)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) {
        let updatedBooking : Booking = {
          id = booking.id;
          seatId = booking.seatId;
          roomId = booking.roomId;
          studentName = booking.studentName;
          studentContact = booking.studentContact;
          bookingDate = booking.bookingDate;
          timeSlot = booking.timeSlot;
          bookingDuration = booking.bookingDuration;
          status = "approved";
          upiTransactionId = booking.upiTransactionId;
          paymentStatus = "paid";
          amount = booking.amount;
        };
        bookings.add(id, updatedBooking);
        updatedBooking;
      };
    };
  };

  public shared ({ caller }) func rejectBooking(id : Nat) : async Booking {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject bookings");
    };
    switch (bookings.get(id)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) {
        let updatedBooking : Booking = {
          id = booking.id;
          seatId = booking.seatId;
          roomId = booking.roomId;
          studentName = booking.studentName;
          studentContact = booking.studentContact;
          bookingDate = booking.bookingDate;
          timeSlot = booking.timeSlot;
          bookingDuration = booking.bookingDuration;
          status = "rejected";
          upiTransactionId = booking.upiTransactionId;
          paymentStatus = booking.paymentStatus;
          amount = booking.amount;
        };
        bookings.add(id, updatedBooking);
        updatedBooking;
      };
    };
  };

  public shared ({ caller }) func cancelBooking(id : Nat) : async Booking {
    // Only the booking owner or admin can cancel
    switch (bookingOwners.get(id)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?owner) {
        if (caller != owner and not (AccessControl.isAdmin(accessControlState, caller))) {
          Runtime.trap("Unauthorized: Only the booking owner or admin can cancel this booking");
        };
      };
    };

    switch (bookings.get(id)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) {
        let updatedBooking : Booking = {
          id = booking.id;
          seatId = booking.seatId;
          roomId = booking.roomId;
          studentName = booking.studentName;
          studentContact = booking.studentContact;
          bookingDate = booking.bookingDate;
          timeSlot = booking.timeSlot;
          bookingDuration = booking.bookingDuration;
          status = "cancelled";
          upiTransactionId = booking.upiTransactionId;
          paymentStatus = booking.paymentStatus;
          amount = booking.amount;
        };
        bookings.add(id, updatedBooking);
        updatedBooking;
      };
    };
  };

  public query ({ caller }) func getBookings() : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all bookings");
    };
    bookings.values().toArray().sort();
  };

  public query ({ caller }) func getBookingsByDate(date : Text) : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view bookings by date");
    };
    bookings.values().toArray().filter(func(booking) { booking.bookingDate == date }).sort();
  };
};
