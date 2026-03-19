import type { Booking } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActor } from "@/hooks/useActor";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Home,
  Loader2,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

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
    if (!actor) return;
    setLoading(true);
    setError("");
    try {
      const result = await actor.getBookings();
      setBookings(result as Booking[]);
    } catch {
      setError("Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    setBookings(null);
    setUsername("");
    setPassword("");
    setError("");
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 py-10">
        <div className="container mx-auto px-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-gray-300 hover:text-white text-sm mb-4 transition-colors"
            data-ocid="admin_login.link"
          >
            <Home className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold text-white">
                  Admin Portal
                </h1>
                <p className="text-gray-300 text-sm mt-0.5">
                  View all bookings
                </p>
              </div>
            </div>
            {bookings !== null && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                data-ocid="admin_login.secondary_button"
                className="border-white/30 text-white hover:bg-white/10 flex items-center gap-1.5"
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
            <Card className="shadow-sm border border-gray-200">
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
                    className="w-full bg-gray-900 text-white hover:bg-gray-700"
                    disabled={loading || isFetching || !actor}
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
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-gray-900">
                All Bookings
                <span className="ml-2 text-base font-normal text-muted-foreground">
                  ({bookings.length} total)
                </span>
              </h2>
            </div>

            {bookings.length === 0 ? (
              <Card
                className="shadow-sm border border-gray-200"
                data-ocid="admin_login.empty_state"
              >
                <CardContent className="py-16 text-center text-muted-foreground">
                  No bookings found.
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
                <table className="w-full text-sm" data-ocid="admin_login.table">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">
                        #
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">
                        Student Name
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">
                        Contact
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">
                        Seat ID
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">
                        Plan
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">
                        Date
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">
                        Amount
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">
                        Payment Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking, idx) => (
                      <tr
                        key={booking.id.toString()}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
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
                          #{booking.seatId.toString()}
                        </td>
                        <td className="px-4 py-3 capitalize">
                          {booking.bookingDuration} —{" "}
                          {booking.timeSlot === "halfday"
                            ? "Half Day"
                            : "Full Day"}
                        </td>
                        <td className="px-4 py-3">{booking.bookingDate}</td>
                        <td className="px-4 py-3 font-medium">
                          ₹{booking.amount.toString()}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={booking.paymentStatus} />
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
