import type { Booking } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useActor } from "@/hooks/useActor";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Home,
  Loader2,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

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
  return (
    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 font-semibold">
      <Clock className="w-3.5 h-3.5 mr-1" /> Pending
    </Badge>
  );
}

export function StudentLoginPage() {
  const { actor, isFetching } = useActor();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !password.trim()) {
      setError("Please enter both Student ID and Password.");
      return;
    }
    if (!actor) return;
    setLoading(true);
    setError("");
    setSearched(false);
    try {
      const result = await actor.getBookingByCredentials(
        studentId.trim(),
        password.trim(),
      );
      setSearched(true);
      if (result === null || result === undefined) {
        setBooking(null);
        setError(
          "Invalid credentials. Please check your Student ID and Password.",
        );
      } else {
        setBooking(result as Booking);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
                      placeholder="Your booking password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading || isFetching}
                    />
                  </div>

                  {error && (
                    <div
                      data-ocid="student_login.error_state"
                      className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    data-ocid="student_login.submit_button"
                    className="w-full bg-gray-900 text-white hover:bg-gray-700"
                    disabled={loading || isFetching || !actor}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      "View Booking"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Booking Details */}
        {booking && searched && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card
              className="shadow-sm border border-gray-200"
              data-ocid="student_login.card"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-display text-xl">
                    Booking Details
                  </CardTitle>
                  <StatusBadge status={booking.paymentStatus} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="w-3 h-3" /> Student Name
                    </span>
                    <span className="font-medium">{booking.studentName}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> Seat ID
                    </span>
                    <span className="font-medium">
                      #{booking.seatId.toString()}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Date
                    </span>
                    <span className="font-medium">{booking.bookingDate}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Plan</span>
                    <span className="font-medium capitalize">
                      {booking.bookingDuration} —{" "}
                      {booking.timeSlot === "halfday" ? "Half Day" : "Full Day"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> Amount
                    </span>
                    <span className="font-medium">
                      ₹{booking.amount.toString()}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">
                      Payment Status
                    </span>
                    <StatusBadge status={booking.paymentStatus} />
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    data-ocid="student_login.secondary_button"
                    onClick={() => {
                      setBooking(null);
                      setSearched(false);
                      setStudentId("");
                      setPassword("");
                    }}
                  >
                    Check Another Booking
                  </Button>
                  <Link to="/">
                    <Button
                      className="w-full bg-gray-900 text-white hover:bg-gray-700"
                      data-ocid="student_login.primary_button"
                    >
                      Go to Home
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </main>
  );
}
