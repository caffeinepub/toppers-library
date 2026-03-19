import type { Booking, BookingResult } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useActor } from "@/hooks/useActor";
import { useRebookSeat } from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Home,
  Key,
  Loader2,
  RefreshCw,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-300 font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approved
      </Badge>
    );
  }
  if (status === "rejected") {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-300 font-semibold">
        <AlertCircle className="w-3.5 h-3.5 mr-1" /> Rejected
      </Badge>
    );
  }
  if (status === "expired") {
    return (
      <Badge className="bg-gray-100 text-gray-600 border-gray-300 font-semibold">
        <Clock className="w-3.5 h-3.5 mr-1" /> Expired
      </Badge>
    );
  }
  return (
    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 font-semibold">
      <Clock className="w-3.5 h-3.5 mr-1" /> Pending
    </Badge>
  );
}

function daysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

export function StudentLoginPage() {
  const { actor, isFetching } = useActor();
  const rebookMutation = useRebookSeat();

  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [adminMessage, setAdminMessage] = useState<string | null>(null);

  // Rebook dialog state
  const [rebookOpen, setRebookOpen] = useState(false);
  const [rebookTxnId, setRebookTxnId] = useState("");
  const [newCredentials, setNewCredentials] = useState<BookingResult | null>(
    null,
  );
  const [credDialogOpen, setCredDialogOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !password.trim()) {
      setError("Please enter both Student ID and Password.");
      return;
    }
    if (!actor) return;
    setLoading(true);
    setError("");
    try {
      const [bookingResult, messageResult] = await Promise.all([
        actor.getBookingByCredentials(studentId.trim(), password.trim()),
        (actor as any)
          .getMessageByCredentials(studentId.trim(), password.trim())
          .catch(() => null),
      ]);
      if (bookingResult === null || bookingResult === undefined) {
        setBooking(null);
        setAdminMessage(null);
        setError(
          "Invalid credentials. Please check your Student ID and Password.",
        );
      } else {
        setBooking(bookingResult as Booking);
        const msg = messageResult as { content?: string } | null;
        setAdminMessage(msg?.content ?? null);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRebook = async () => {
    if (!rebookTxnId.trim()) {
      toast.error("Please enter your UPI Transaction ID.");
      return;
    }
    try {
      const result = await rebookMutation.mutateAsync({
        studentId: studentId.trim(),
        password: password.trim(),
        newUpiTransactionId: rebookTxnId.trim(),
      });
      setRebookOpen(false);
      setRebookTxnId("");
      setNewCredentials(result as BookingResult);
      setCredDialogOpen(true);
    } catch {
      toast.error(
        "Rebook failed. Please check your credentials and try again.",
      );
    }
  };

  const expiryDays = booking?.expiryDate
    ? daysUntilExpiry(booking.expiryDate)
    : null;
  const isExpired =
    booking?.status === "expired" || (expiryDays !== null && expiryDays < 0);
  const isExpiringSoon =
    expiryDays !== null && expiryDays >= 0 && expiryDays <= 5;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 py-10">
        <div className="container mx-auto px-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-gray-300 hover:text-white text-sm mb-4 transition-colors"
            data-ocid="student_login.link"
          >
            <Home className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-white">
                Student Portal
              </h1>
              <p className="text-gray-300 text-sm mt-0.5">
                View your booking details
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-lg">
        {/* Login Form */}
        {!booking && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="font-display text-xl">
                  Check Your Booking
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Enter the credentials you received after booking.
                </p>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                  data-ocid="student_login.dialog"
                >
                  <div>
                    <Label
                      htmlFor="student-id"
                      className="text-sm font-medium mb-1.5 block"
                    >
                      Student ID
                    </Label>
                    <Input
                      id="student-id"
                      data-ocid="student_login.input"
                      placeholder="e.g. TL-1234"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      disabled={loading || isFetching}
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="student-password"
                      className="text-sm font-medium mb-1.5 block"
                    >
                      Password
                    </Label>
                    <Input
                      id="student-password"
                      type="password"
                      data-ocid="student_login.input"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading || isFetching}
                    />
                  </div>
                  {error && (
                    <div
                      data-ocid="student_login.error_state"
                      className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-gray-900 text-white hover:bg-gray-700"
                    data-ocid="student_login.submit_button"
                    disabled={loading || isFetching}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      "View My Booking"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Booking Details */}
        {booking && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Admin Message */}
            {adminMessage && (
              <div
                data-ocid="student_login.toast"
                className="flex items-start gap-3 bg-yellow-50 border border-yellow-300 rounded-xl px-4 py-3"
              >
                <Bell className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-yellow-800 mb-0.5">
                    Message from Admin
                  </p>
                  <p className="text-sm text-yellow-700">{adminMessage}</p>
                </div>
              </div>
            )}

            {/* Expiry Warnings */}
            {isExpired && (
              <div
                data-ocid="student_login.error_state"
                className="flex items-start gap-3 bg-red-50 border border-red-300 rounded-xl px-4 py-3"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">
                  Your booking has expired. Please rebook to renew your seat.
                </p>
              </div>
            )}

            {!isExpired && isExpiringSoon && booking.expiryDate && (
              <div
                data-ocid="student_login.toast"
                className="flex items-start gap-3 bg-orange-50 border border-orange-300 rounded-xl px-4 py-3"
              >
                <Clock className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <p className="text-sm text-orange-700">
                  Your booking expires on <strong>{booking.expiryDate}</strong>.
                  Rebook to keep your seat!
                </p>
              </div>
            )}

            {/* Booking Card */}
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-display text-xl">
                    Your Booking
                  </CardTitle>
                  <StatusBadge status={booking.paymentStatus} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <User className="w-3 h-3" /> Name
                    </p>
                    <p className="font-semibold text-gray-900">
                      {booking.studentName}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> Seat
                    </p>
                    <p className="font-semibold text-gray-900">
                      #{booking.seatId.toString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Start Date
                    </p>
                    <p className="font-semibold text-gray-900">
                      {booking.bookingDate}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Expiry Date
                    </p>
                    <p
                      className={`font-semibold ${isExpired ? "text-red-600" : isExpiringSoon ? "text-orange-600" : "text-gray-900"}`}
                    >
                      {booking.expiryDate || "—"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Plan</p>
                    <p className="font-semibold text-gray-900 capitalize">
                      {booking.timeSlot === "halfday"
                        ? "Half Day"
                        : booking.timeSlot === "fullday"
                          ? "Full Day"
                          : booking.timeSlot}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Amount</p>
                    <p className="font-semibold text-gray-900">
                      ₹{booking.amount.toString()}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="text-xs text-muted-foreground">
                  <p>Booking ID: #{booking.id.toString()}</p>
                  <p>UPI Txn: {booking.upiTransactionId || "—"}</p>
                </div>

                {/* Rebook Button */}
                <Button
                  className="w-full bg-gray-900 text-white hover:bg-gray-700"
                  data-ocid="student_login.primary_button"
                  onClick={() => setRebookOpen(true)}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Rebook Seat (Renew 30 Days)
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  data-ocid="student_login.secondary_button"
                  onClick={() => {
                    setBooking(null);
                    setAdminMessage(null);
                    setStudentId("");
                    setPassword("");
                    setError("");
                  }}
                >
                  Log Out
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Rebook Dialog */}
      <Dialog open={rebookOpen} onOpenChange={setRebookOpen}>
        <DialogContent data-ocid="student_login.dialog" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Rebook Your Seat
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your seat will be renewed for another 30 days from today. Please
              complete the UPI payment first.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <p className="text-sm text-amber-600 mb-1">Amount to Pay</p>
              <p className="text-2xl font-bold text-amber-700">
                ₹{booking?.timeSlot === "fullday" ? "1,200" : "600"}
                <span className="text-sm font-normal text-amber-500">
                  /month
                </span>
              </p>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
              <div className="flex justify-center mb-2">
                <img
                  src="/assets/uploads/image-1.png"
                  alt="UPI QR Code"
                  className="w-36 h-36 object-contain rounded-lg border border-gray-200"
                />
              </div>
              <p className="text-sm font-bold text-gray-900">
                6388259986@ptaxis
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Scan with any UPI app
              </p>
            </div>
            <div>
              <Label
                htmlFor="rebook-txn"
                className="text-sm font-medium mb-1.5 block"
              >
                UPI Transaction ID *
              </Label>
              <Input
                id="rebook-txn"
                data-ocid="student_login.input"
                placeholder="Enter transaction ID after payment"
                value={rebookTxnId}
                onChange={(e) => setRebookTxnId(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              data-ocid="student_login.cancel_button"
              onClick={() => {
                setRebookOpen(false);
                setRebookTxnId("");
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-gray-900 text-white hover:bg-gray-700"
              data-ocid="student_login.confirm_button"
              onClick={handleRebook}
              disabled={rebookMutation.isPending || !rebookTxnId.trim()}
            >
              {rebookMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Rebooking...
                </>
              ) : (
                "Confirm Rebook"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Credentials Dialog */}
      <Dialog open={credDialogOpen} onOpenChange={setCredDialogOpen}>
        <DialogContent data-ocid="student_login.modal" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Rebooked Successfully!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your seat has been rebooked for another 30 days. You've been
              assigned new login credentials.
            </p>
            {newCredentials && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center">
                    <Key className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Your NEW login credentials:
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      Save these immediately!
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
                      {newCredentials.studentId}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      Password
                    </p>
                    <p className="font-bold text-lg text-gray-900 tracking-wide">
                      {newCredentials.password}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  ⚠️ Your old credentials are no longer valid. Save these new
                  credentials.
                </p>
              </div>
            )}
            <Button
              className="w-full bg-gray-900 text-white hover:bg-gray-700"
              data-ocid="student_login.close_button"
              onClick={() => {
                setCredDialogOpen(false);
                setBooking(null);
                setStudentId("");
                setPassword("");
              }}
            >
              Done — Log In with New Credentials
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
