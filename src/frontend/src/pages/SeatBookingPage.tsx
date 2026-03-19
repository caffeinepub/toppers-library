import type { BookingResult, Seat } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateBooking,
  useRoomBookingSeatStatus,
  useRooms,
  useSeatsByRoom,
} from "@/hooks/useQueries";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  CreditCard,
  Key,
  Loader2,
  Snowflake,
  Star,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const MONTHLY_SLOTS = [
  {
    value: "halfday",
    label: "Half Day",
    desc: "One shift/day for 30 days",
    price: 600,
  },
  {
    value: "fullday",
    label: "Full Day",
    desc: "All shifts/day for 30 days",
    price: 1200,
  },
];

const UPI_ID = "6388259986@ptaxis";

const SKELETON_IDS = Array.from({ length: 20 }, (_, i) => `sk${i + 1}`);

function calcMonthlyPrice(slot: string): number {
  return slot === "fullday" ? 1200 : 600;
}

function SeatBox({
  seat,
  index,
  isOccupied,
  isPartial,
  onClick,
}: {
  seat: Seat;
  index: number;
  isOccupied: boolean;
  isPartial: boolean;
  onClick: () => void;
}) {
  const available = !isOccupied;
  const colorClass = isOccupied
    ? "border-red-700 bg-red-950/60 text-red-300 cursor-not-allowed opacity-70"
    : isPartial
      ? "border-amber-500 bg-amber-950/60 text-amber-300 cursor-pointer hover:shadow-md hover:border-amber-400"
      : "border-green-600 bg-green-950/60 text-green-300 cursor-pointer hover:shadow-md hover:border-green-400";

  const title = isOccupied
    ? `Seat ${seat.seatNumber} — Fully Booked`
    : isPartial
      ? `Seat ${seat.seatNumber} — Half-Day taken (1 slot left)`
      : `Seat ${seat.seatNumber} — Available`;

  return (
    <motion.button
      type="button"
      data-ocid={`seat.item.${index}`}
      whileHover={available ? { scale: 1.05 } : {}}
      whileTap={available ? { scale: 0.97 } : {}}
      onClick={available ? onClick : undefined}
      disabled={!available}
      className={`relative w-16 h-16 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all font-medium text-xs ${colorClass}`}
      title={title}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-6 h-6"
        aria-hidden="true"
      >
        <path
          d="M7 13V7a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v6M5 17h14M7 17v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <rect
          x="6"
          y="12"
          width="12"
          height="6"
          rx="1"
          fill="currentColor"
          opacity="0.4"
        />
      </svg>
      <span>{seat.seatNumber}</span>
    </motion.button>
  );
}

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
          step >= 1
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        1
      </div>
      <span
        className={`text-xs font-medium ${step >= 1 ? "text-foreground" : "text-muted-foreground"}`}
      >
        Details &amp; Plan
      </span>
      <div className="flex-1 h-px bg-border" />
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
          step >= 2
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        2
      </div>
      <span
        className={`text-xs font-medium ${step >= 2 ? "text-foreground" : "text-muted-foreground"}`}
      >
        Payment
      </span>
    </div>
  );
}

export function SeatBookingPage() {
  const { roomId } = useParams({ from: "/rooms/$roomId" });
  const roomIdBig = BigInt(roomId);

  const { data: rooms } = useRooms();
  const { data: seats, isLoading } = useSeatsByRoom(roomIdBig);
  const createBooking = useCreateBooking();

  const room = rooms?.find((r) => r.id === roomIdBig);

  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState<1 | 2>(1);
  const [bookingDate, setBookingDate] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentContact, setStudentContact] = useState("");
  const [monthlySlot, setMonthlySlot] = useState<string>("halfday");
  const [upiTxnId, setUpiTxnId] = useState("");
  const [dateHighlight, setDateHighlight] = useState(false);
  const [credentials, setCredentials] = useState<BookingResult | null>(null);
  const [credDialogOpen, setCredDialogOpen] = useState(false);

  const dateInputRef = useRef<HTMLInputElement>(null);

  const todayStr = new Date().toISOString().split("T")[0];

  const { data: seatStatus } = useRoomBookingSeatStatus(roomIdBig);
  const fullyBookedIds = seatStatus?.fullyBookedIds ?? new Set<string>();
  const halfDayBookedIds = seatStatus?.halfDayBookedIds ?? new Set<string>();

  const totalAmount = calcMonthlyPrice(monthlySlot);

  const resetDialogState = () => {
    setDialogStep(1);
    setStudentName("");
    setStudentContact("");
    setMonthlySlot("halfday");
    setUpiTxnId("");
    setSelectedSeat(null);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      resetDialogState();
    }
  };

  const handleSeatClick = (seat: Seat) => {
    if (!bookingDate) {
      toast.error("Please select a date first before choosing a seat.");
      setDateHighlight(true);
      setTimeout(() => setDateHighlight(false), 2000);
      dateInputRef.current?.focus();
      dateInputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }
    setSelectedSeat(seat);
    // If seat is half-day booked, pre-select halfday (only option)
    const sid = seat.id.toString();
    setMonthlySlot(halfDayBookedIds.has(sid) ? "halfday" : "halfday");
    setDialogStep(1);
    setUpiTxnId("");
    setStudentName("");
    setStudentContact("");
    setDialogOpen(true);
  };

  const handleProceedToPayment = () => {
    if (!studentName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!studentContact.trim()) {
      toast.error("Please enter your contact number.");
      return;
    }
    setDialogStep(2);
  };

  const handleSubmit = async () => {
    if (!upiTxnId.trim()) {
      toast.error("Please enter your UPI Transaction ID.");
      return;
    }
    if (!selectedSeat) return;

    try {
      const result = await createBooking.mutateAsync({
        seatId: selectedSeat.id,
        studentName: studentName.trim(),
        studentContact: studentContact.trim(),
        bookingDate,
        timeSlot: monthlySlot,
        bookingDuration: "monthly",
        upiTransactionId: upiTxnId.trim(),
        amount: BigInt(totalAmount),
      });
      setCredentials(result as BookingResult);
      setDialogOpen(false);
      resetDialogState();
      setCredDialogOpen(true);
    } catch {
      toast.error("Seat already booked for this slot. Please choose another.");
    }
  };

  const totalCount = seats?.length ?? 0;
  const fullyOccupiedCount = fullyBookedIds.size;
  const partialCount = halfDayBookedIds.size;
  const availableCount = totalCount - fullyOccupiedCount - partialCount;

  const slotLabel =
    MONTHLY_SLOTS.find((s) => s.value === monthlySlot)?.label ?? monthlySlot;

  // Determine if a seat is occupied based on selected plan
  const isSeatOccupied = (seatId: string) => {
    if (monthlySlot === "fullday") {
      return fullyBookedIds.has(seatId) || halfDayBookedIds.has(seatId);
    }
    // halfday: only fully booked seats are unavailable
    return fullyBookedIds.has(seatId);
  };

  const isSeatPartial = (seatId: string) => {
    // Only show partial for halfday plan selection
    return monthlySlot === "halfday" && halfDayBookedIds.has(seatId);
  };

  const selectedSeatIsPartial =
    selectedSeat && halfDayBookedIds.has(selectedSeat.id.toString());

  return (
    <main className="min-h-screen bg-background">
      <div className="bg-navy-800 py-12">
        <div className="container mx-auto px-4">
          <Link
            to="/rooms"
            className="inline-flex items-center gap-1.5 text-navy-200 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Rooms
          </Link>
          {room ? (
            <div className="flex flex-wrap items-start gap-4">
              <div>
                <h1 className="font-display text-4xl font-bold text-white mb-2">
                  {room.name}
                </h1>
                <p className="text-navy-200">{room.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {room.isAC && (
                    <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30">
                      <Snowflake className="w-3.5 h-3.5 mr-1" /> Air Conditioned
                    </Badge>
                  )}
                  <Badge className="bg-navy-600 text-navy-100 border-navy-500">
                    <Users className="w-3.5 h-3.5 mr-1" /> Capacity:{" "}
                    {room.capacity.toString()}
                  </Badge>
                  <Badge className="bg-navy-600 text-navy-100 border-navy-500">
                    <Star className="w-3.5 h-3.5 mr-1" /> Condition:{" "}
                    {room.condition}
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <Skeleton className="h-10 w-64 bg-navy-600" />
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Pricing info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-5 h-5 text-blue-600 shrink-0" />
            <span className="font-semibold text-blue-800 text-sm">
              Monthly Pricing
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="bg-white rounded-lg p-3 border border-blue-100 text-center">
              <p className="text-xs text-gray-500 mb-1">Half Day</p>
              <p className="font-bold text-blue-700 text-lg">₹600</p>
              <p className="text-xs text-gray-400">1 shift/day · 30 days</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-blue-100 text-center">
              <p className="text-xs text-gray-500 mb-1">Full Day</p>
              <p className="font-bold text-blue-700 text-lg">₹1,200</p>
              <p className="text-xs text-gray-400">all shifts · 30 days</p>
            </div>
          </div>
        </div>

        {/* Date Selector */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8 shadow-navy-sm">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">
            Select Start Date
          </h2>
          <div>
            <Label
              htmlFor="booking-date"
              className={`text-sm font-medium mb-1.5 block transition-colors ${
                dateHighlight ? "text-red-600" : ""
              }`}
            >
              Date{" "}
              {dateHighlight && (
                <span className="text-red-500">← Select a date to book</span>
              )}
            </Label>
            <motion.div
              animate={
                dateHighlight
                  ? {
                      scale: [1, 1.02, 1, 1.02, 1],
                      transition: { duration: 0.5, repeat: 3 },
                    }
                  : {}
              }
            >
              <Input
                ref={dateInputRef}
                id="booking-date"
                type="date"
                data-ocid="booking.date_input"
                min={todayStr}
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className={`w-full max-w-xs transition-all ${
                  dateHighlight
                    ? "border-red-500 ring-2 ring-red-300 bg-red-50"
                    : ""
                }`}
              />
            </motion.div>
          </div>

          {bookingDate && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge className="bg-green-900/30 text-green-400 border-green-700/40">
                {availableCount} fully available
              </Badge>
              <Badge className="bg-amber-900/30 text-amber-400 border-amber-700/40">
                {partialCount} half-day taken
              </Badge>
              <Badge className="bg-red-900/30 text-red-400 border-red-700/40">
                {fullyOccupiedCount} fully booked
              </Badge>
            </div>
          )}

          {!bookingDate && (
            <p className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              ⚠️ Please select a start date above before clicking on a seat to
              book it.
            </p>
          )}
        </div>

        {/* Seat Map */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-navy-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Seat Map
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded border-2 border-green-600 bg-green-950/60" />
                Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded border-2 border-amber-500 bg-amber-950/60" />
                Half-Day Taken
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded border-2 border-red-700 bg-red-950/60" />
                Fully Booked
              </span>
            </div>
          </div>

          <div className="w-full bg-navy-800 border border-navy-700 rounded-lg py-2 text-center text-navy-200 text-xs font-semibold tracking-widest mb-8">
            FRONT DESK / ENTRANCE
          </div>

          {isLoading ? (
            <div
              data-ocid="seat.loading_state"
              className="flex flex-wrap gap-3 justify-center"
            >
              {SKELETON_IDS.map((id) => (
                <Skeleton key={id} className="w-16 h-16 rounded-lg" />
              ))}
            </div>
          ) : !seats || seats.length === 0 ? (
            <div data-ocid="seat.empty_state" className="text-center py-12">
              <p className="text-muted-foreground">
                No seats found for this room.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 justify-center">
              {seats.map((seat, i) => {
                const sid = seat.id.toString();
                return (
                  <SeatBox
                    key={sid}
                    seat={seat}
                    index={i + 1}
                    isOccupied={isSeatOccupied(sid)}
                    isPartial={isSeatPartial(sid)}
                    onClick={() => handleSeatClick(seat)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent data-ocid="booking.dialog" className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Reserve Your Seat
            </DialogTitle>
          </DialogHeader>

          <StepIndicator step={dialogStep} />

          {dialogStep === 1 && (
            <div className="space-y-5">
              {selectedSeat && (
                <div className="bg-navy-800 rounded-lg p-3 border border-navy-700">
                  <p className="text-sm font-semibold text-navy-100">
                    Seat {selectedSeat.seatNumber} — {room?.name}
                  </p>
                  <p className="text-xs text-navy-300 mt-0.5">
                    Start: {bookingDate} · 30 days
                  </p>
                  {selectedSeatIsPartial && (
                    <p className="text-xs text-amber-400 mt-1">
                      ⚡ This seat has a half-day booking — only Half Day plan
                      available
                    </p>
                  )}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-700">
                  Monthly booking — valid for 30 days from start date.
                </p>
              </div>

              <div>
                <Label
                  htmlFor="student-name"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Full Name *
                </Label>
                <Input
                  id="student-name"
                  data-ocid="booking.input"
                  placeholder="Enter your full name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </div>
              <div>
                <Label
                  htmlFor="student-contact"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Contact Number *
                </Label>
                <Input
                  id="student-contact"
                  placeholder="Enter your contact number"
                  value={studentContact}
                  onChange={(e) => setStudentContact(e.target.value)}
                />
              </div>

              {/* Monthly Plan Selection */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Select Monthly Plan *
                </Label>
                <div className="space-y-2">
                  {MONTHLY_SLOTS.map((slot) => {
                    const sid = selectedSeat?.id.toString() ?? "";
                    const isDisabled =
                      slot.value === "fullday" && halfDayBookedIds.has(sid);
                    return (
                      <label
                        key={slot.value}
                        htmlFor={`mslot-${slot.value}`}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          isDisabled
                            ? "opacity-40 cursor-not-allowed border-border"
                            : monthlySlot === slot.value
                              ? "border-blue-500 bg-blue-50 cursor-pointer"
                              : "border-border hover:border-blue-400/40 cursor-pointer"
                        }`}
                      >
                        <input
                          type="radio"
                          id={`mslot-${slot.value}`}
                          name="monthly-slot"
                          value={slot.value}
                          checked={monthlySlot === slot.value}
                          onChange={() =>
                            !isDisabled && setMonthlySlot(slot.value)
                          }
                          disabled={isDisabled}
                          data-ocid="booking.radio"
                          className="accent-blue-600"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{slot.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {isDisabled
                              ? "Not available — seat already has a half-day booking"
                              : slot.desc}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-blue-600">
                          ₹{slot.price}/month
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div
                data-ocid="payment.amount_section"
                className="bg-primary/5 border border-primary/20 rounded-lg p-4"
              >
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    Monthly —{" "}
                    {MONTHLY_SLOTS.find((s) => s.value === monthlySlot)?.label}
                  </span>
                  <span className="font-bold text-lg text-primary">
                    ₹{totalAmount}/mo
                  </span>
                </div>
              </div>

              <DialogFooter className="gap-2 pt-1">
                <Button
                  variant="outline"
                  data-ocid="booking.cancel_button"
                  onClick={() => handleDialogOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleProceedToPayment}
                  className="bg-primary text-primary-foreground"
                >
                  Proceed to Payment →
                </Button>
              </DialogFooter>
            </div>
          )}

          {dialogStep === 2 && (
            <div className="space-y-5">
              <div
                data-ocid="payment.amount_section"
                className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center"
              >
                <p className="text-sm text-amber-600 mb-1">Amount to Pay</p>
                <p className="text-3xl font-bold text-amber-700">
                  ₹{totalAmount}
                  <span className="text-base font-normal text-amber-500">
                    /month
                  </span>
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Monthly {slotLabel} &bull; Start: {bookingDate} (30 days)
                </p>
              </div>

              <div
                data-ocid="payment.upi_id_section"
                className="border-2 border-dashed border-primary/30 rounded-xl p-5 text-center bg-primary/[0.02]"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Pay via UPI
                </p>
                <div className="flex justify-center mb-3">
                  <img
                    src="/assets/uploads/image-1.png"
                    alt="UPI QR Code"
                    className="w-48 h-48 object-contain rounded-lg border border-border shadow-sm"
                  />
                </div>
                <p className="text-base font-bold text-foreground tracking-wide">
                  {UPI_ID}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Scan with any UPI app (PhonePe, GPay, Paytm)
                </p>
              </div>

              <Separator />

              <div>
                <Label
                  htmlFor="upi-txn"
                  className="text-sm font-medium mb-1.5 block"
                >
                  UPI Transaction ID *
                </Label>
                <Textarea
                  id="upi-txn"
                  data-ocid="payment.transaction_input"
                  placeholder="Enter the transaction ID from your UPI app after payment"
                  value={upiTxnId}
                  onChange={(e) => setUpiTxnId(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1.5 flex items-start gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-amber-500 shrink-0" />
                  Your booking will be confirmed after admin verifies the
                  payment.
                </p>
              </div>

              <DialogFooter className="gap-2 pt-1">
                <Button variant="outline" onClick={() => setDialogStep(1)}>
                  ← Back
                </Button>
                <Button
                  data-ocid="payment.submit_button"
                  onClick={handleSubmit}
                  disabled={createBooking.isPending || !upiTxnId.trim()}
                  className="bg-primary text-primary-foreground"
                >
                  {createBooking.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Credentials Dialog */}
      <Dialog open={credDialogOpen} onOpenChange={setCredDialogOpen}>
        <DialogContent data-ocid="credentials.dialog" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Booking Submitted!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your booking is pending admin approval. Save your login
              credentials below to check your booking status later.
            </p>
            {credentials && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center">
                    <Key className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Your login credentials:
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      Keep these safe!
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      Student ID
                    </p>
                    <p className="font-bold text-lg text-gray-900 tracking-wide">
                      {credentials.studentId}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      Password
                    </p>
                    <p className="font-bold text-lg text-gray-900 tracking-wide">
                      {credentials.password}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  ⚠️ Save these credentials. You will need them to check your
                  booking status.
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Link to="/student-login" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full"
                  data-ocid="credentials.secondary_button"
                  onClick={() => setCredDialogOpen(false)}
                >
                  Go to Student Login
                </Button>
              </Link>
              <Button
                className="flex-1 bg-gray-900 text-white hover:bg-gray-700"
                data-ocid="credentials.primary_button"
                onClick={() => setCredDialogOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
