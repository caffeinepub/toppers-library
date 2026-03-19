import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import { useBookings, useSeatsByRoom } from "@/hooks/useQueries";
import type { Seat } from "@/hooks/useQueries";
import { BookingStatus } from "@/hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { CheckCircle, Copy, Grid3x3, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type SeatColor = "green" | "amber" | "red";
type FlowStep = "idle" | "booking" | "payment" | "success";

interface BookingCreds {
  bookingId: bigint;
  studentId: string;
  password: string;
}

function getSeatColor(
  seat: Seat,
  bookingsBySeat: Map<string, { fullDay: number; halfDay: number }>,
): SeatColor {
  if (!seat.isAvailable) return "red";
  const info = bookingsBySeat.get(seat.id.toString());
  if (!info) return "green";
  if (info.fullDay > 0 || info.halfDay >= 2) return "red";
  if (info.halfDay === 1) return "amber";
  return "green";
}

export function SeatBookingPage() {
  const { roomId } = useParams({ from: "/rooms/$roomId" });
  const roomIdBig = BigInt(roomId);
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const { data: seats = [], isLoading: seatsLoading } =
    useSeatsByRoom(roomIdBig);
  const { data: allBookings = [], isLoading: bookingsLoading } = useBookings();

  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [step, setStep] = useState<FlowStep>("idle");
  const [creds, setCreds] = useState<BookingCreds | null>(null);

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [plan, setPlan] = useState<"half" | "full">("half");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [txId, setTxId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const expiryDate = useMemo(() => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  }, [startDate]);

  const bookingsBySeat = useMemo(() => {
    const map = new Map<string, { fullDay: number; halfDay: number }>();
    const active = allBookings.filter(
      (b) =>
        b.roomId === roomIdBig &&
        b.status !== BookingStatus.cancelled &&
        b.status !== BookingStatus.rejected &&
        b.status !== BookingStatus.expired,
    );
    for (const b of active) {
      const key = b.seatId.toString();
      const cur = map.get(key) ?? { fullDay: 0, halfDay: 0 };
      if (b.timeSlot === "full-day") cur.fullDay++;
      else cur.halfDay++;
      map.set(key, cur);
    }
    return map;
  }, [allBookings, roomIdBig]);

  function openBooking(seat: Seat) {
    const color = getSeatColor(seat, bookingsBySeat);
    if (color === "red") return;
    setSelectedSeat(seat);
    setStep("booking");
    setPlan("half");
    setName("");
    setContact("");
    setTxId("");
    setStartDate(new Date().toISOString().slice(0, 10));
  }

  async function handleBook() {
    if (!actor || !selectedSeat) return;
    if (!name.trim() || !contact.trim()) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const timeSlot = plan === "half" ? "half-day" : "full-day";
      const amount = plan === "half" ? 600n : 1200n;
      const result = await actor.createBooking(
        selectedSeat.id,
        name.trim(),
        contact.trim(),
        startDate,
        expiryDate,
        timeSlot,
        "monthly",
        "",
        amount,
      );
      setCreds({
        bookingId: result.bookingId,
        studentId: result.studentId,
        password: result.password,
      });
      setStep("payment");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["seats"] });
    } catch {
      toast.error("Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePayment() {
    if (!actor || !creds) return;
    setSubmitting(true);
    try {
      if (txId.trim()) {
        await actor.updateBookingPayment(creds.bookingId, txId.trim());
      }
      setStep("success");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    } catch {
      toast.error("Failed to update payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function closeDialog() {
    setSelectedSeat(null);
    setStep("idle");
    setCreds(null);
  }

  const loading = seatsLoading || bookingsLoading;
  const isAmber = selectedSeat
    ? getSeatColor(selectedSeat, bookingsBySeat) === "amber"
    : false;

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative min-h-[40vh] flex items-center text-white overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/assets/uploads/Untitled-design-1--1.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-black/72" />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/50 to-transparent" />
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-16 py-16">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-5">
            <Grid3x3 className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-white/90 font-medium">
              Live Seat Map
            </span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
            Select Your <span className="text-amber-400">Seat</span>
          </h1>
          <p className="text-lg text-white/70 max-w-xl">
            Click an available seat below to begin your booking. Green seats are
            available, amber have one slot left.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4">
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-8 p-4 bg-card rounded-xl border border-border">
            {[
              { color: "bg-emerald-500", label: "Available" },
              { color: "bg-amber-400", label: "Half-Day Booked (1 slot left)" },
              { color: "bg-red-500/70", label: "Fully Booked" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <div className={`w-4 h-4 rounded ${item.color}`} />
                {item.label}
              </div>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {Array.from({ length: 60 }).map((_, i) => (
                <Skeleton
                  key={String(i)}
                  className="h-10 w-full rounded bg-card"
                />
              ))}
            </div>
          ) : seats.length === 0 ? (
            <div className="text-center py-20" data-ocid="seats.empty_state">
              <p className="text-muted-foreground">
                No seats found for this room.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {seats.map((seat) => {
                const color = getSeatColor(seat, bookingsBySeat);
                return (
                  <button
                    type="button"
                    key={seat.id.toString()}
                    onClick={() => openBooking(seat)}
                    disabled={color === "red"}
                    className={`h-10 rounded text-xs font-semibold transition-all ${
                      color === "green"
                        ? "seat-green"
                        : color === "amber"
                          ? "seat-amber"
                          : "seat-red"
                    }`}
                    title={`Seat ${seat.seatNumber} — ${
                      color === "green"
                        ? "Available"
                        : color === "amber"
                          ? "Half-Day Booked"
                          : "Fully Booked"
                    }`}
                    data-ocid={`seats.item.${Number(seat.id)}`}
                  >
                    {seat.seatNumber}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Booking Dialog */}
      <Dialog
        open={step !== "idle"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent
          className="max-w-md bg-white text-zinc-900"
          data-ocid="seats.booking.dialog"
        >
          {step === "booking" && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-zinc-900">
                  Book Seat {selectedSeat?.seatNumber}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label htmlFor="book-name" className="text-zinc-700">
                    Student Name *
                  </Label>
                  <Input
                    id="book-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="mt-1 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400"
                    data-ocid="seats.name.input"
                  />
                </div>
                <div>
                  <Label htmlFor="book-contact" className="text-zinc-700">
                    Contact Number *
                  </Label>
                  <Input
                    id="book-contact"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Enter your mobile number"
                    className="mt-1 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400"
                    data-ocid="seats.contact.input"
                  />
                </div>
                <div>
                  <Label className="text-zinc-700">Plan</Label>
                  <div className="flex gap-3 mt-1">
                    <button
                      type="button"
                      onClick={() => setPlan("half")}
                      className={`flex-1 py-2 rounded border text-sm font-medium transition-colors ${
                        plan === "half"
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                      }`}
                      data-ocid="seats.half_day.toggle"
                    >
                      Half Day — ₹600
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isAmber) setPlan("full");
                      }}
                      disabled={isAmber}
                      className={`flex-1 py-2 rounded border text-sm font-medium transition-colors ${
                        plan === "full"
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : isAmber
                            ? "opacity-40 cursor-not-allowed bg-white text-zinc-400 border-zinc-200"
                            : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                      }`}
                      data-ocid="seats.full_day.toggle"
                    >
                      Full Day — ₹1,200
                    </button>
                  </div>
                  {isAmber && (
                    <p className="text-xs text-amber-600 mt-1">
                      Seat already has a half-day booking. Only Half Day
                      available.
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="start-date" className="text-zinc-700">
                      Start Date
                    </Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-1 bg-white border-zinc-200 text-zinc-900"
                      data-ocid="seats.start_date.input"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-700">Expiry Date</Label>
                    <Input
                      value={expiryDate}
                      readOnly
                      className="mt-1 bg-zinc-50 border-zinc-200 text-zinc-700"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleBook}
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  data-ocid="seats.confirm_booking.button"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Confirm Booking — ₹{plan === "half" ? "600" : "1,200"}/month
                </Button>
              </div>
            </>
          )}

          {step === "payment" && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-zinc-900">
                  Complete Payment
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                  Your booking is created! Please complete payment to get it
                  confirmed by admin.
                </div>
                <div className="flex flex-col items-center gap-3">
                  <img
                    src="/assets/uploads/image-1.png"
                    alt="UPI QR Code"
                    className="w-48 h-48 object-contain rounded border border-zinc-200"
                  />
                  <div className="text-center">
                    <p className="text-xs text-zinc-500">UPI ID</p>
                    <p className="font-bold text-zinc-900 font-mono">
                      6388259986@ptaxis
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Ashutosh Pratap Singh
                    </p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="tx-id" className="text-zinc-700">
                    UPI Transaction ID (optional)
                  </Label>
                  <Input
                    id="tx-id"
                    value={txId}
                    onChange={(e) => setTxId(e.target.value)}
                    placeholder="Enter transaction ID after payment"
                    className="mt-1 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400"
                    data-ocid="seats.transaction_id.input"
                  />
                </div>
                <Button
                  onClick={handlePayment}
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  data-ocid="seats.confirm_payment.button"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  I've Made the Payment
                </Button>
              </div>
            </>
          )}

          {step === "success" && creds && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-emerald-700">
                  Booking Submitted!
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">
                    Payment recorded. Admin will confirm shortly.
                  </span>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-3">
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">
                    Your Login Credentials
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-400">Student ID</p>
                      <p className="font-mono font-bold text-zinc-900">
                        {creds.studentId}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(creds.studentId);
                        toast.success("Copied!");
                      }}
                      className="p-2 text-zinc-400 hover:text-zinc-700"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-400">Password</p>
                      <p className="font-mono font-bold text-zinc-900">
                        {creds.password}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(creds.password);
                        toast.success("Copied!");
                      }}
                      className="p-2 text-zinc-400 hover:text-zinc-700"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-red-600 font-medium">
                  ⚠ Save these credentials now. You'll need them to track your
                  booking.
                </p>
                <Button
                  onClick={closeDialog}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  data-ocid="seats.done.button"
                >
                  Done
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
