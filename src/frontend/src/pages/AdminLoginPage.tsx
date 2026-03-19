import type { Booking } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActor } from "@/hooks/useActor";
import {
  useApproveBooking,
  useDeleteBooking,
  useRejectBooking,
  useSendMessage,
} from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  Clock,
  Home,
  Loader2,
  LogOut,
  Send,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const ADMIN_USERNAME = "addmin";
const ADMIN_PASSWORD = "topperslibrary739";

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

export function AdminLoginPage() {
  const { actor, isFetching } = useActor();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [messageInputs, setMessageInputs] = useState<Record<string, string>>(
    {},
  );

  const approveBookingMutation = useApproveBooking();
  const rejectBookingMutation = useRejectBooking();
  const deleteBookingMutation = useDeleteBooking();
  const sendMessageMutation = useSendMessage();

  const refreshBookings = async () => {
    if (!actor) return;
    try {
      const result = await actor.getBookings();
      setBookings(result as Booking[]);
    } catch {
      toast.error("Could not refresh bookings. Please try again.");
    }
  };

  const handleApprove = async (id: bigint, studentName: string) => {
    try {
      await approveBookingMutation.mutateAsync(id);
      toast.success(`Payment approved for ${studentName}`);
      await refreshBookings();
    } catch {
      toast.error("Failed to approve payment.");
    }
  };

  const handleReject = async (id: bigint, studentName: string) => {
    if (!confirm(`Reject booking for ${studentName}?`)) return;
    try {
      await rejectBookingMutation.mutateAsync(id);
      toast.success(`Booking rejected for ${studentName}.`);
      await refreshBookings();
    } catch {
      toast.error("Failed to reject booking.");
    }
  };

  const handleRemove = async (id: bigint, studentName: string) => {
    if (
      !confirm(
        `Remove student "${studentName}" and free their seat? This cannot be undone.`,
      )
    )
      return;
    try {
      await deleteBookingMutation.mutateAsync(id);
      toast.success(`Student removed and seat freed for ${studentName}.`);
      await refreshBookings();
    } catch {
      toast.error("Failed to remove student.");
    }
  };

  const handleSendMessage = async (bookingId: bigint, studentName: string) => {
    const msg = messageInputs[bookingId.toString()] ?? "";
    if (!msg.trim()) {
      toast.error("Please type a message before sending.");
      return;
    }
    try {
      await sendMessageMutation.mutateAsync({ bookingId, content: msg.trim() });
      toast.success(`Message sent to ${studentName}`);
      setMessageInputs((prev) => ({ ...prev, [bookingId.toString()]: "" }));
    } catch {
      toast.error("Failed to send message.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }
    if (
      username.trim() !== ADMIN_USERNAME ||
      password.trim() !== ADMIN_PASSWORD
    ) {
      setError("Invalid credentials. Please check your username and password.");
      return;
    }

    // Credentials are valid — log in immediately with empty bookings list
    setError("");
    setBookings([]);

    // Then attempt to load bookings in the background
    if (actor) {
      setLoading(true);
      try {
        const result = await actor.getBookings();
        setBookings(result as Booking[]);
      } catch {
        toast.error("Could not load bookings. Please refresh.");
        // Keep empty array — admin stays logged in
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSignOut = () => {
    setBookings(null);
    setUsername("");
    setPassword("");
    setError("");
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-navy-800 py-10">
        <div className="container mx-auto px-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-navy-300 hover:text-white text-sm mb-4 transition-colors"
            data-ocid="admin_login.link"
          >
            <Home className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-gold-500" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold text-white">
                  Admin Portal
                </h1>
                <p className="text-navy-300 text-sm mt-0.5">
                  View &amp; manage all bookings
                </p>
              </div>
            </div>
            {bookings !== null && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                data-ocid="admin_login.secondary_button"
                className="border-navy-400 text-navy-100 hover:bg-navy-700 hover:text-white flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Login Form */}
        {bookings === null && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-md mx-auto"
          >
            <Card className="shadow-sm border border-border">
              <CardHeader className="pb-4">
                <CardTitle className="font-display text-xl">
                  Admin Login
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Enter your admin credentials to view all bookings.
                </p>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                  data-ocid="admin_login.dialog"
                >
                  <div>
                    <Label
                      htmlFor="admin-username"
                      className="text-sm font-medium mb-1.5 block"
                    >
                      Username
                    </Label>
                    <Input
                      id="admin-username"
                      data-ocid="admin_login.input"
                      placeholder="Admin username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={loading || isFetching}
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="admin-password"
                      className="text-sm font-medium mb-1.5 block"
                    >
                      Password
                    </Label>
                    <Input
                      id="admin-password"
                      type="password"
                      data-ocid="admin_login.input"
                      placeholder="Admin password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading || isFetching}
                    />
                  </div>

                  {error && (
                    <div
                      data-ocid="admin_login.error_state"
                      className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    data-ocid="admin_login.submit_button"
                    className="w-full bg-black text-white hover:bg-black/80"
                    disabled={loading || isFetching}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "View All Bookings"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* All Bookings Table */}
        {bookings !== null && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-bold text-foreground">
                All Bookings
                <span className="ml-2 text-base font-normal text-muted-foreground">
                  ({bookings.length} total)
                </span>
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {bookings.filter((b) => b.paymentStatus === "approved").length}{" "}
                approved
                <span className="w-2 h-2 rounded-full bg-yellow-400 ml-2" />
                {bookings.filter((b) => b.paymentStatus === "pending").length}{" "}
                pending
              </div>
            </div>

            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading bookings…
              </div>
            )}

            {bookings.length === 0 && !loading ? (
              <Card
                className="shadow-sm border border-border"
                data-ocid="admin_login.empty_state"
              >
                <CardContent className="py-16 text-center text-muted-foreground">
                  No bookings found.
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border shadow-navy-sm bg-card">
                <table className="w-full text-sm" data-ocid="admin_login.table">
                  <thead className="bg-muted/60 border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">
                        #
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">
                        Student
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">
                        Contact
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">
                        Room / Seat
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">
                        Plan
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">
                        Dates
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">
                        Amount
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking, idx) => (
                      <tr
                        key={booking.id.toString()}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                        data-ocid={`admin_login.item.${idx + 1}`}
                      >
                        <td className="px-4 py-3 text-muted-foreground">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {booking.studentName}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {booking.studentContact}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium">
                            {booking.roomId === 1n ? "Hall A" : "Hall B"}
                          </span>
                          <span className="text-muted-foreground">
                            {" "}
                            — #{booking.seatId.toString()}
                          </span>
                        </td>
                        <td className="px-4 py-3 capitalize">
                          {booking.timeSlot === "halfday"
                            ? "Half Day"
                            : "Full Day"}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div>{booking.bookingDate}</div>
                          <div className="text-muted-foreground">
                            → {booking.expiryDate || "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          ₹{booking.amount.toString()}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={booking.paymentStatus} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1 flex-wrap">
                              {booking.paymentStatus === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleApprove(
                                        booking.id,
                                        booking.studentName,
                                      )
                                    }
                                    disabled={approveBookingMutation.isPending}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-2 text-xs"
                                    data-ocid={`admin_login.booking.approve_button.${idx + 1}`}
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />{" "}
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      handleReject(
                                        booking.id,
                                        booking.studentName,
                                      )
                                    }
                                    disabled={rejectBookingMutation.isPending}
                                    className="h-7 px-2 text-xs"
                                    data-ocid={`admin_login.booking.reject_button.${idx + 1}`}
                                  >
                                    <XCircle className="w-3 h-3 mr-1" /> Reject
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleRemove(booking.id, booking.studentName)
                                }
                                disabled={deleteBookingMutation.isPending}
                                className="h-7 px-2 text-xs border-border text-muted-foreground hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                                data-ocid={`admin_login.booking.delete_button.${idx + 1}`}
                              >
                                <Trash2 className="w-3 h-3 mr-1" /> Remove
                              </Button>
                            </div>
                            {/* Send message — only for pending bookings */}
                            {booking.paymentStatus === "pending" && (
                              <div className="flex items-center gap-1 min-w-[220px]">
                                <Input
                                  value={
                                    messageInputs[booking.id.toString()] ?? ""
                                  }
                                  onChange={(e) =>
                                    setMessageInputs((prev) => ({
                                      ...prev,
                                      [booking.id.toString()]: e.target.value,
                                    }))
                                  }
                                  placeholder="Send message to student…"
                                  className="h-7 text-xs"
                                  data-ocid="admin_login.input"
                                />
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleSendMessage(
                                      booking.id,
                                      booking.studentName,
                                    )
                                  }
                                  className="bg-blue-600 hover:bg-blue-700 text-white h-7 px-2 text-xs shrink-0"
                                  data-ocid={`admin_login.booking.secondary_button.${idx + 1}`}
                                >
                                  <Send className="w-3 h-3 mr-1" /> Send
                                </Button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </main>
  );
}
