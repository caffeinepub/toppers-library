import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActor } from "@/hooks/useActor";
import type { Booking, Message } from "@/hooks/useQueries";
import { BookingStatus, PaymentStatus } from "@/hooks/useQueries";
import {
  AlertTriangle,
  BookOpen,
  Copy,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type RebookStep = "idle" | "payment" | "success";

export function StudentLoginPage() {
  const { actor } = useActor();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [adminMsg, setAdminMsg] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [creds, setCreds] = useState({ id: "", pw: "" });
  const [rebookStep, setRebookStep] = useState<RebookStep>("idle");
  const [rbTxId, setRbTxId] = useState("");
  const [rbSubmitting, setRbSubmitting] = useState(false);
  const [newCreds, setNewCreds] = useState<{
    studentId: string;
    password: string;
  } | null>(null);

  async function handleLogin() {
    if (!actor) {
      toast.error("Connecting to server...");
      return;
    }
    if (!studentId.trim() || !password.trim()) {
      toast.error("Enter your credentials");
      return;
    }
    setLoading(true);
    try {
      const b = await actor.getBookingByCredentials(
        studentId.trim(),
        password.trim(),
      );
      if (!b) {
        toast.error(
          "Invalid credentials. Please check your Student ID and Password.",
        );
        return;
      }
      let latestMsg: Message | null = null;
      try {
        const msgs = await actor.getMessagesByBooking(b.id);
        latestMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
      } catch {
        /* ignore */
      }
      setBooking(b);
      setAdminMsg(latestMsg);
      setCreds({ id: studentId.trim(), pw: password.trim() });
      setLoggedIn(true);
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRebook() {
    if (!actor) return;
    setRbSubmitting(true);
    try {
      const result = await actor.rebookSeat(creds.id, creds.pw);
      setNewCreds({ studentId: result.studentId, password: result.password });
      setRebookStep("success");
      toast.success("Seat rebooked successfully!");
    } catch {
      toast.error("Rebook failed. Please try again.");
    } finally {
      setRbSubmitting(false);
    }
  }

  function logout() {
    setLoggedIn(false);
    setBooking(null);
    setAdminMsg(null);
    setStudentId("");
    setPassword("");
    setRebookStep("idle");
    setNewCreds(null);
  }

  const daysUntilExpiry = booking
    ? Math.ceil(
        (new Date(booking.expiryDate).getTime() - Date.now()) / 86400000,
      )
    : 999;
  const isExpired = daysUntilExpiry <= 0;
  const isExpiringSoon = !isExpired && daysUntilExpiry <= 5;
  const showRebook = isExpired || isExpiringSoon;

  if (!loggedIn) {
    return (
      <main className="min-h-screen bg-background">
        <section className="relative min-h-[45vh] flex items-center text-white overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url('/assets/uploads/Untitled-design-1--1.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-black/72" />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/50 to-transparent" />
          <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-16 py-16">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-5">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-white/90 font-medium">
                Student Portal
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
              Student <span className="text-amber-400">Login</span>
            </h1>
            <p className="text-lg text-white/70 max-w-xl">
              Access your booking details with the credentials received after
              registration.
            </p>
          </div>
        </section>

        <section className="py-16 flex items-center justify-center">
          <div className="w-full max-w-md px-4">
            <div className="bg-card rounded-xl border border-border shadow-xl shadow-black/20 p-8">
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Welcome Back
                </h2>
                <p className="text-muted-foreground text-sm mt-2">
                  Enter the credentials received after booking
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sid" className="text-foreground">
                    Student ID
                  </Label>
                  <Input
                    id="sid"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. TL-2024-0001"
                    className="mt-1 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleLogin();
                    }}
                    data-ocid="student.id.input"
                  />
                </div>
                <div>
                  <Label htmlFor="spw" className="text-foreground">
                    Password
                  </Label>
                  <Input
                    id="spw"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="mt-1 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleLogin();
                    }}
                    data-ocid="student.password.input"
                  />
                </div>
                <Button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/80 text-white shadow-md shadow-primary/30"
                  data-ocid="student.login.button"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Login
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <section className="relative min-h-[30vh] flex items-center text-white overflow-hidden">
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
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-16 py-12 flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold mb-1">
              My <span className="text-amber-400">Booking</span>
            </h1>
            <p className="text-white/60 text-sm">Student ID: {creds.id}</p>
          </div>
          <Button
            variant="outline"
            onClick={logout}
            size="sm"
            className="border-white/30 text-white hover:bg-white/10 bg-transparent"
            data-ocid="student.logout.button"
          >
            Logout
          </Button>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-2xl mx-auto px-4 space-y-6">
          {adminMsg && (
            <div
              className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex gap-3"
              data-ocid="student.admin_message.panel"
            >
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300 text-sm">
                  Message from Admin
                </p>
                <p className="text-amber-200 text-sm mt-1">
                  {adminMsg.content}
                </p>
              </div>
            </div>
          )}

          {isExpired && (
            <div
              className="bg-red-500/10 border border-red-500/30 rounded-xl p-4"
              data-ocid="student.expired.error_state"
            >
              <p className="text-red-300 font-semibold text-sm">
                Your booking has expired. Please rebook to continue using the
                library.
              </p>
            </div>
          )}
          {isExpiringSoon && !isExpired && (
            <div
              className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4"
              data-ocid="student.expiring.error_state"
            >
              <p className="text-orange-300 font-semibold text-sm">
                ⚠ Your booking expires in {daysUntilExpiry} day
                {daysUntilExpiry !== 1 ? "s" : ""}. Rebook now to avoid losing
                your seat.
              </p>
            </div>
          )}

          {booking && (
            <div className="bg-card rounded-xl border border-border shadow-lg shadow-black/20 p-6">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                Booking Details
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Seat Number</p>
                  <p className="font-semibold text-foreground">
                    {booking.seatId.toString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Plan</p>
                  <p className="font-semibold text-foreground">
                    {booking.timeSlot === "full-day" ? "Full Day" : "Half Day"}{" "}
                    — ₹{Number(booking.amount)}/month
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Start Date</p>
                  <p className="font-semibold text-foreground">
                    {booking.bookingDate}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expiry Date</p>
                  <p className="font-semibold text-foreground">
                    {booking.expiryDate}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Booking Status</p>
                  <Badge
                    className={
                      booking.status === BookingStatus.approved
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : booking.status === BookingStatus.rejected ||
                            booking.status === BookingStatus.cancelled
                          ? "bg-red-500/20 text-red-300 border-red-500/30"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    }
                  >
                    {booking.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Status</p>
                  <Badge
                    className={
                      booking.paymentStatus === PaymentStatus.paid
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    }
                  >
                    {booking.paymentStatus === PaymentStatus.paid
                      ? "✓ Confirmed"
                      : booking.paymentStatus === PaymentStatus.submitted
                        ? "Payment Submitted"
                        : "⏳ Payment Pending"}
                  </Badge>
                </div>
              </div>
              {booking.paymentStatus === PaymentStatus.pending && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Pay to UPI:{" "}
                    <span className="font-mono font-bold text-foreground">
                      6388259986@ptaxis
                    </span>{" "}
                    (Ashutosh Pratap Singh)
                  </p>
                </div>
              )}
            </div>
          )}

          {showRebook && rebookStep === "idle" && (
            <div className="bg-card rounded-xl border border-border shadow-lg shadow-black/20 p-6">
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                Renew Your Seat
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Rebook the same seat for another 30 days at the same rate.
              </p>
              <Button
                onClick={() => setRebookStep("payment")}
                className="bg-primary hover:bg-primary/80 text-white shadow-md shadow-primary/30"
                data-ocid="student.rebook.button"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Rebook Seat
              </Button>
            </div>
          )}

          {rebookStep === "payment" && (
            <div className="bg-card rounded-xl border border-border shadow-lg shadow-black/20 p-6">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                Complete Payment to Rebook
              </h2>
              <div className="flex flex-col items-center gap-3 mb-4">
                <img
                  src="/assets/uploads/image-1.png"
                  alt="UPI QR"
                  className="w-40 h-40 object-contain rounded border border-border"
                />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">UPI ID</p>
                  <p className="font-mono font-bold text-foreground">
                    6388259986@ptaxis
                  </p>
                </div>
              </div>
              <div className="mb-4">
                <Label htmlFor="rb-tx" className="text-foreground">
                  Transaction ID (optional)
                </Label>
                <Input
                  id="rb-tx"
                  value={rbTxId}
                  onChange={(e) => setRbTxId(e.target.value)}
                  placeholder="Enter UPI transaction ID"
                  className="mt-1 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  data-ocid="student.rebook_tx.input"
                />
              </div>
              <Button
                onClick={handleRebook}
                disabled={rbSubmitting}
                className="w-full bg-primary hover:bg-primary/80 text-white shadow-md shadow-primary/30"
                data-ocid="student.rebook_confirm.button"
              >
                {rbSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Confirm Rebook
              </Button>
            </div>
          )}

          {rebookStep === "success" && newCreds && (
            <div className="bg-card rounded-xl border border-border shadow-lg shadow-black/20 p-6">
              <h2 className="font-display text-lg font-semibold text-emerald-400 mb-4">
                Rebook Successful!
              </h2>
              <div className="bg-secondary rounded-lg p-4 space-y-3 border border-border">
                <p className="text-xs text-muted-foreground font-medium uppercase">
                  New Credentials
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Student ID</p>
                    <p className="font-mono font-bold text-foreground">
                      {newCreds.studentId}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(newCreds.studentId);
                      toast.success("Copied!");
                    }}
                  >
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Password</p>
                    <p className="font-mono font-bold text-foreground">
                      {newCreds.password}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(newCreds.password);
                      toast.success("Copied!");
                    }}
                  >
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
