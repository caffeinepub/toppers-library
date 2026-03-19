import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Migration "migration";

(with migration = Migration.run)
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
    expiryDate : Text;
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

  type Message = {
    id : Nat;
    bookingId : Nat;
    content : Text;
    timestamp : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  let rooms = Map.empty<Nat, Room>();
  let seats = Map.empty<Nat, Seat>();
  let bookings = Map.empty<Nat, Booking>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let credentials = Map.empty<Text, StudentCredential>();
  let messages = Map.empty<Nat, Message>();
  var roomIdCounter = 1;
  var seatIdCounter = 1;
  var bookingIdCounter = 1;
  var messageIdCounter = 1;

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

  func doInitialize() {
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

  // Auto-initialize on actor start
  doInitialize();

  public shared func _initialize() : async () {
    doInitialize();
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  // Create booking - open access
  public shared func createBooking(seatId : Nat, studentName : Text, studentContact : Text, bookingDate : Text, expiryDate : Text, timeSlot : Text, bookingDuration : Text, upiTransactionId : Text, amount : Nat) : async BookingResult {
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
          expiryDate;
          timeSlot;
          bookingDuration;
          status = "pending";
          upiTransactionId;
          paymentStatus = "pending";
          amount;
        };
        bookings.add(bookingIdCounter, newBooking);

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

  public query func getRooms() : async [Room] {
    rooms.values().toArray().sort();
  };

  public shared func updateSeatAvailability(id : Nat, isAvailable : Bool) : async Seat {
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

  public query func getSeatsByRoom(roomId : Nat) : async [Seat] {
    seats.values().toArray().filter(func(seat) { seat.roomId == roomId });
  };

  public query func getSeat(id : Nat) : async Seat {
    switch (seats.get(id)) {
      case (null) { Runtime.trap("Seat not found") };
      case (?seat) { seat };
    };
  };

  public query func isSeatAvailable(seatId : Nat, date : Text, timeSlot : Text) : async Bool {
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

  public query func getBookedSeatIds(date : Text, timeSlot : Text) : async [Nat] {
    bookings.values().toArray()
      .filter(func(b) { b.bookingDate == date and b.timeSlot == timeSlot and (b.status == "pending" or b.status == "approved") })
      .map(func(b) { b.seatId });
  };

  // Get all booked seat IDs for a room (monthly bookings)
  public query func getBookedSeatIdsByRoom(roomId : Nat) : async [Nat] {
    bookings.values().toArray()
      .filter(func(b) { b.roomId == roomId and (b.status == "pending" or b.status == "approved") })
      .map(func(b) { b.seatId });
  };

  public query func getBookingByCredentials(studentId : Text, password : Text) : async ?Booking {
    switch (credentials.get(studentId)) {
      case (null) { null };
      case (?cred) {
        if (cred.password == password) {
          bookings.get(cred.bookingId);
        } else { null };
      };
    };
  };

  public shared func updateBookingPayment(id : Nat, upiTransactionId : Text) : async Booking {
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
          expiryDate = booking.expiryDate;
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

  // Admin: approve booking
  public shared func approveBooking(id : Nat) : async Booking {
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
          expiryDate = booking.expiryDate;
          timeSlot = booking.timeSlot;
          bookingDuration = booking.bookingDuration;
          status = "approved";
          upiTransactionId = booking.upiTransactionId;
          paymentStatus = "paid";
          amount = booking.amount;
        };
        bookings.add(id, updatedBooking);
        switch (seats.get(booking.seatId)) {
          case (null) {};
          case (?seat) {
            let updatedSeat : Seat = {
              id = seat.id;
              roomId = seat.roomId;
              seatNumber = seat.seatNumber;
              seatType = seat.seatType;
              isAvailable = false;
            };
            seats.add(seat.id, updatedSeat);
          };
        };
        updatedBooking;
      };
    };
  };

  // Admin: reject booking
  public shared func rejectBooking(id : Nat) : async Booking {
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
          expiryDate = booking.expiryDate;
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

  // Admin: delete a booking and free the seat
  public shared func deleteBooking(id : Nat) : async Bool {
    switch (bookings.get(id)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) {
        switch (seats.get(booking.seatId)) {
          case (null) {};
          case (?seat) {
            let updatedSeat : Seat = {
              id = seat.id;
              roomId = seat.roomId;
              seatNumber = seat.seatNumber;
              seatType = seat.seatType;
              isAvailable = true;
            };
            seats.add(seat.id, updatedSeat);
          };
        };
        let sid = generateStudentId(id);
        credentials.remove(sid);
        bookings.remove(id);
        true;
      };
    };
  };

  public shared func cancelBooking(id : Nat) : async Booking {
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
          expiryDate = booking.expiryDate;
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

  public query func getBookings() : async [Booking] {
    bookings.values().toArray().sort();
  };

  public query func getBookingsByDate(date : Text) : async [Booking] {
    bookings.values().toArray().filter(func(booking) { booking.bookingDate == date }).sort();
  };

  // Admin: send message to a student (stored per bookingId, replaces previous)
  public shared func sendMessage(bookingId : Nat, content : Text, timestamp : Int) : async Message {
    let toRemove = messages.values().toArray().filter(func(m) { m.bookingId == bookingId });
    for (m in toRemove.values()) {
      messages.remove(m.id);
    };
    let newMsg : Message = {
      id = messageIdCounter;
      bookingId;
      content;
      timestamp;
    };
    messages.add(messageIdCounter, newMsg);
    messageIdCounter += 1;
    newMsg;
  };

  // Student: get message for their booking
  public query func getMessageByCredentials(studentId : Text, password : Text) : async ?Message {
    switch (credentials.get(studentId)) {
      case (null) { null };
      case (?cred) {
        if (cred.password != password) { return null };
        let msgs = messages.values().toArray().filter(func(m) { m.bookingId == cred.bookingId });
        if (msgs.isEmpty()) { null } else { ?msgs[0] };
      };
    };
  };

  // Admin: get messages for a booking
  public query func getMessagesByBooking(bookingId : Nat) : async [Message] {
    messages.values().toArray().filter(func(m) { m.bookingId == bookingId });
  };

  // Rebook: student renews same seat for another 30 days
  public shared func rebookSeat(studentId : Text, password : Text, newBookingDate : Text, newExpiryDate : Text, newUpiTransactionId : Text) : async BookingResult {
    switch (credentials.get(studentId)) {
      case (null) { Runtime.trap("Invalid student ID") };
      case (?cred) {
        if (cred.password != password) { Runtime.trap("Invalid password") };
        switch (bookings.get(cred.bookingId)) {
          case (null) { Runtime.trap("Original booking not found") };
          case (?orig) {
            let newBooking : Booking = {
              id = bookingIdCounter;
              seatId = orig.seatId;
              roomId = orig.roomId;
              studentName = orig.studentName;
              studentContact = orig.studentContact;
              bookingDate = newBookingDate;
              expiryDate = newExpiryDate;
              timeSlot = orig.timeSlot;
              bookingDuration = orig.bookingDuration;
              status = "pending";
              upiTransactionId = newUpiTransactionId;
              paymentStatus = "pending";
              amount = orig.amount;
            };
            bookings.add(bookingIdCounter, newBooking);
            let sid = generateStudentId(bookingIdCounter);
            let pwd = generatePassword(bookingIdCounter);
            let newCred : StudentCredential = {
              bookingId = bookingIdCounter;
              studentId = sid;
              password = pwd;
            };
            credentials.add(sid, newCred);
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
    };
  };

  // Mark expired bookings and free seats (called from frontend with today's date)
  public shared func expireOldBookings(currentDate : Text) : async Nat {
    var count = 0;
    for (booking in bookings.values().toArray().values()) {
      if (booking.status == "approved" and booking.expiryDate != "" and booking.expiryDate < currentDate) {
        let expired : Booking = {
          id = booking.id;
          seatId = booking.seatId;
          roomId = booking.roomId;
          studentName = booking.studentName;
          studentContact = booking.studentContact;
          bookingDate = booking.bookingDate;
          expiryDate = booking.expiryDate;
          timeSlot = booking.timeSlot;
          bookingDuration = booking.bookingDuration;
          status = "expired";
          upiTransactionId = booking.upiTransactionId;
          paymentStatus = booking.paymentStatus;
          amount = booking.amount;
        };
        bookings.add(booking.id, expired);
        switch (seats.get(booking.seatId)) {
          case (null) {};
          case (?seat) {
            let freed : Seat = {
              id = seat.id;
              roomId = seat.roomId;
              seatNumber = seat.seatNumber;
              seatType = seat.seatType;
              isAvailable = true;
            };
            seats.add(seat.id, freed);
          };
        };
        count += 1;
      };
    };
    count;
  };
};
