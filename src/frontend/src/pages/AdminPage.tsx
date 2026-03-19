import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { useBookings, useRooms, useSeats } from "@/hooks/useQueries";
import type { Booking } from "@/hooks/useQueries";
import { BookingStatus, PaymentStatus } from "@/hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Clock,
  DollarSign,
  Loader2,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const ADMIN_KEY = "toppers_admin_auth";

function parseDate(d: string) {
  return new Date(d).getTime();
}

function formatINR(n: number) {
  return `\u20b9${n.toLocaleString("en-IN")}`;
}

// Simple bar chart
function BarChart({
  data,
  label,
}: { data: { name: string; value: number }[]; label: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="w-full">
      <p className="text-xs text-zinc-400 mb-3 uppercase tracking-wide">
        {label}
      </p>
      <div className="flex items-end gap-1 h-32">
        {data.map((d) => (
          <div key={d.name} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-amber-400 rounded-t transition-all"
              style={{
                height: `${(d.value / max) * 100}%`,
                minHeight: d.value > 0 ? "4px" : "2px",
              }}
              title={`${d.name}: ${d.value}`}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-zinc-600">{data[0]?.name}</span>
        <span className="text-xs text-zinc-600">
          {data[data.length - 1]?.name}
        </span>
      </div>
    </div>
  );
}

export function AdminPage() {
  const [authed, setAuthed] = useState(
    () => localStorage.getItem(ADMIN_KEY) === "true",
  );
  const [username, setUsername] = useState("");
  const [pw, setPw] = useState("");
  const [loginErr, setLoginErr] = useState("");

  const { actor } = useActor();
  const queryClient = useQueryClient();

  const {
    data: bookings = [],
    isLoading: bookLoading,
    refetch: refetchBookings,
  } = useBookings();
  const { data: rooms = [] } = useRooms();
  const { data: seats = [] } = useSeats();

  // Message dialog
  const [msgBookingId, setMsgBookingId] = useState<bigint | null>(null);
  const [msgText, setMsgText] = useState("");
  const [msgSending, setMsgSending] = useState(false);

  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  function handleLogin() {
    if (username === "addmin" && pw === "topperslibrary739") {
      localStorage.setItem(ADMIN_KEY, "true");
      setAuthed(true);
      refetchBookings();
    } else {
      setLoginErr("Invalid credentials");
    }
  }

  function handleLogout() {
    localStorage.removeItem(ADMIN_KEY);
    setAuthed(false);
  }

  async function handleApprove(id: bigint) {
    if (!actor) return;
    setActionLoading(`${id.toString()}-approve`);
    try {
      const b = await actor.approveBooking(id);
      toast.success(`Booking approved for ${b.studentName}`);
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    } catch {
      toast.error("Failed to approve");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id: bigint) {
    if (!actor) return;
    setActionLoading(`${id.toString()}-reject`);
    try {
      const b = await actor.rejectBooking(id);
      toast.success(`Booking rejected for ${b.studentName}`);
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["seats"] });
    } catch {
      toast.error("Failed to reject");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(id: bigint, name: string) {
    if (!actor) return;
    setActionLoading(`${id.toString()}-delete`);
    try {
      await actor.deleteBooking(id);
      toast.success(`Booking for ${name} removed`);
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["seats"] });
    } catch {
      toast.error("Failed to remove");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSendMessage() {
    if (!actor || !msgBookingId || !msgText.trim()) return;
    setMsgSending(true);
    try {
      await actor.sendMessage(
        msgBookingId,
        "admin",
        "student",
        msgText.trim(),
        BigInt(Date.now()),
      );
      toast.success("Message sent");
      setMsgBookingId(null);
      setMsgText("");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setMsgSending(false);
    }
  }

  // Analytics
  const analytics = useMemo(() => {
    const now = Date.now();
    const weekMs = 7 * 86400000;

    const active = bookings.filter(
      (b) =>
        b.status !== BookingStatus.cancelled &&
        b.status !== BookingStatus.rejected,
    );
    const approved = bookings.filter(
      (b) => b.paymentStatus === PaymentStatus.paid,
    );
    const pending = bookings.filter(
      (b) =>
        b.paymentStatus === PaymentStatus.pending &&
        b.status !== BookingStatus.rejected &&
        b.status !== BookingStatus.cancelled,
    );
    const totalRevenue = approved.reduce((s, b) => s + Number(b.amount), 0);

    const thisWeekStart = now - weekMs;
    const lastWeekStart = now - 2 * weekMs;
    const thisWeekRev = approved
      .filter((b) => parseDate(b.bookingDate) >= thisWeekStart)
      .reduce((s, b) => s + Number(b.amount), 0);
    const lastWeekRev = approved
      .filter(
        (b) =>
          parseDate(b.bookingDate) >= lastWeekStart &&
          parseDate(b.bookingDate) < thisWeekStart,
      )
      .reduce((s, b) => s + Number(b.amount), 0);

    const monthStart = new Date();
    monthStart.setDate(1);
    const monthRevenue = approved
      .filter((b) => parseDate(b.bookingDate) >= monthStart.getTime())
      .reduce((s, b) => s + Number(b.amount), 0);

    const days14: { name: string; value: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      days14.push({
        name: ds.slice(5),
        value: bookings.filter((b) => b.bookingDate === ds).length,
      });
    }

    const expiringThisWeek = active.filter((b) => {
      const diff = parseDate(b.expiryDate) - now;
      return diff >= 0 && diff <= weekMs;
    }).length;

    const roomCounts: Record<string, number> = {};
    for (const b of active) {
      roomCounts[b.roomId.toString()] =
        (roomCounts[b.roomId.toString()] || 0) + 1;
    }
    const topRoomId =
      Object.entries(roomCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const topRoom = rooms.find((r) => r.id.toString() === topRoomId);

    const dayCounts: Record<string, number> = {};
    for (const b of active) {
      dayCounts[b.bookingDate] = (dayCounts[b.bookingDate] || 0) + 1;
    }
    const peakDay =
      Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    const bookedSeats = new Set(active.map((b) => b.seatId.toString())).size;

    const halfDayCount = approved.filter(
      (b) => b.timeSlot === "half-day",
    ).length;
    const fullDayCount = approved.filter(
      (b) => b.timeSlot === "full-day",
    ).length;

    return {
      total: bookings.length,
      active: active.length,
      pending: pending.length,
      approved: approved.length,
      totalRevenue,
      thisWeekRev,
      lastWeekRev,
      monthRevenue,
      days14,
      expiringThisWeek,
      topRoom: topRoom?.name ?? "—",
      peakDay,
      bookedSeats,
      halfDayCount,
      fullDayCount,
      halfDayRev: halfDayCount * 600,
      fullDayRev: fullDayCount * 1200,
    };
  }, [bookings, rooms]);

  const filteredBookings = useMemo(
    () =>
      bookings.filter((b) =>
        b.studentName.toLowerCase().includes(search.toLowerCase()),
      ),
    [bookings, search],
  );

  const availableSeats = seats.filter((s) => s.isAvailable).length;

  const activeBookingsBySeat = useMemo(() => {
    const map = new Map<string, Booking[]>();
    const active = bookings.filter(
      (b) =>
        b.status !== BookingStatus.cancelled &&
        b.status !== BookingStatus.rejected,
    );
    for (const b of active) {
      const k = b.seatId.toString();
      map.set(k, [...(map.get(k) ?? []), b]);
    }
    return map;
  }, [bookings]);

  function getSeatStatus(seatId: bigint): "green" | "amber" | "red" {
    const bs = activeBookingsBySeat.get(seatId.toString()) ?? [];
    const full = bs.some((b) => b.timeSlot === "full-day");
    const halfCount = bs.filter((b) => b.timeSlot === "half-day").length;
    if (full || halfCount >= 2) return "red";
    if (halfCount === 1) return "amber";
    return "green";
  }

  function paymentBadgeClass(ps: PaymentStatus) {
    if (ps === PaymentStatus.paid)
      return "bg-emerald-900/50 text-emerald-300 border-emerald-700";
    if (ps === PaymentStatus.submitted)
      return "bg-blue-900/50 text-blue-300 border-blue-700";
    return "bg-yellow-900/50 text-yellow-300 border-yellow-700";
  }

  // LOGIN SCREEN
  if (!authed) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-zinc-900" />
            </div>
            <h1 className="font-display text-3xl font-bold text-white">
              Admin Portal
            </h1>
            <p className="text-zinc-400 text-sm mt-2">
              Toppers Library Management
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-8">
            <div className="space-y-4">
              <div>
                <Label className="text-zinc-300" htmlFor="auser">
                  Username
                </Label>
                <Input
                  id="auser"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="mt-1 bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLogin();
                  }}
                  data-ocid="admin.username.input"
                />
              </div>
              <div>
                <Label className="text-zinc-300" htmlFor="apw">
                  Password
                </Label>
                <Input
                  id="apw"
                  type="password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="Enter password"
                  className="mt-1 bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLogin();
                  }}
                  data-ocid="admin.password.input"
                />
              </div>
              {loginErr && <p className="text-red-400 text-sm">{loginErr}</p>}
              <Button
                onClick={handleLogin}
                className="w-full bg-amber-400 text-zinc-900 hover:bg-amber-300 font-semibold"
                data-ocid="admin.login.button"
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-400 rounded flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-zinc-900" />
          </div>
          <div>
            <h1 className="font-display font-bold text-white text-lg">
              Toppers Library
            </h1>
            <p className="text-xs text-zinc-400">Admin Dashboard</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-white text-sm"
          data-ocid="admin.logout.button"
        >
          Logout
        </Button>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        <Tabs defaultValue="dashboard">
          <TabsList className="bg-zinc-900 border border-zinc-700 mb-6">
            {["dashboard", "bookings", "rooms", "seats", "revenue"].map((t) => (
              <TabsTrigger
                key={t}
                value={t}
                className="data-[state=active]:bg-amber-400 data-[state=active]:text-zinc-900 text-zinc-400 capitalize"
                data-ocid={`admin.${t}.tab`}
              >
                {t}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* TAB: DASHBOARD */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                {
                  label: "Total Bookings",
                  value: analytics.total,
                  icon: BookOpen,
                  color: "text-blue-400",
                },
                {
                  label: "Active Bookings",
                  value: analytics.approved,
                  icon: Users,
                  color: "text-emerald-400",
                },
                {
                  label: "Pending Approval",
                  value: analytics.pending,
                  icon: Clock,
                  color: "text-amber-400",
                },
                {
                  label: "Total Revenue",
                  value: formatINR(analytics.totalRevenue),
                  icon: DollarSign,
                  color: "text-green-400",
                },
              ].map((c) => (
                <div
                  key={c.label}
                  className="bg-zinc-900 border border-zinc-700 rounded-xl p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-zinc-400 uppercase tracking-wide">
                      {c.label}
                    </span>
                    <c.icon className={`w-4 h-4 ${c.color}`} />
                  </div>
                  <div className="text-2xl font-bold font-display text-white">
                    {c.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5">
                <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">
                  This Week
                </p>
                <p className="text-xl font-bold text-white">
                  {formatINR(analytics.thisWeekRev)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {analytics.thisWeekRev >= analytics.lastWeekRev ? (
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-400" />
                  )}
                  <span
                    className={`text-xs ${
                      analytics.thisWeekRev >= analytics.lastWeekRev
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    vs last week {formatINR(analytics.lastWeekRev)}
                  </span>
                </div>
              </div>
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5">
                <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">
                  This Month
                </p>
                <p className="text-xl font-bold text-white">
                  {formatINR(analytics.monthRevenue)}
                </p>
              </div>
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5">
                <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">
                  Seats Booked
                </p>
                <p className="text-xl font-bold text-white">
                  {analytics.bookedSeats} / 80
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {availableSeats} available
                </p>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 mb-6">
              <BarChart
                data={analytics.days14}
                label="Daily Bookings (Last 14 Days)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5">
                <p className="text-xs text-zinc-400 uppercase tracking-wide mb-2">
                  Most Booked Room
                </p>
                <p className="text-lg font-bold text-amber-400">
                  {analytics.topRoom}
                </p>
              </div>
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5">
                <p className="text-xs text-zinc-400 uppercase tracking-wide mb-2">
                  Expiring This Week
                </p>
                <p className="text-lg font-bold text-orange-400">
                  {analytics.expiringThisWeek} bookings
                </p>
              </div>
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5">
                <p className="text-xs text-zinc-400 uppercase tracking-wide mb-2">
                  Peak Booking Day
                </p>
                <p className="text-lg font-bold text-emerald-400">
                  {analytics.peakDay}
                </p>
              </div>
            </div>
          </TabsContent>

          {/* TAB: BOOKINGS */}
          <TabsContent value="bookings">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-white">
                All Bookings ({bookings.length})
              </h2>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name..."
                className="w-64 bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-500"
                data-ocid="admin.search.input"
              />
            </div>
            {bookLoading ? (
              <div
                className="space-y-2"
                data-ocid="admin.bookings.loading_state"
              >
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full bg-zinc-800" />
                ))}
              </div>
            ) : filteredBookings.length === 0 ? (
              <div
                className="text-center py-16 text-zinc-500"
                data-ocid="admin.bookings.empty_state"
              >
                {bookings.length === 0
                  ? "No bookings yet."
                  : "No bookings match your search."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-700 text-zinc-400 uppercase text-xs tracking-wide">
                      <th className="text-left py-3 px-2">ID</th>
                      <th className="text-left py-3 px-2">Student</th>
                      <th className="text-left py-3 px-2">Contact</th>
                      <th className="text-left py-3 px-2">Seat</th>
                      <th className="text-left py-3 px-2">Plan</th>
                      <th className="text-left py-3 px-2">Start</th>
                      <th className="text-left py-3 px-2">Expiry</th>
                      <th className="text-left py-3 px-2">Payment</th>
                      <th className="text-left py-3 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((b, idx) => {
                      const isLoading = (s: string) =>
                        actionLoading === `${b.id.toString()}-${s}`;
                      return (
                        <tr
                          key={b.id.toString()}
                          className="border-b border-zinc-800 hover:bg-zinc-900/50"
                          data-ocid={`admin.bookings.item.${idx + 1}`}
                        >
                          <td className="py-3 px-2 text-zinc-400 font-mono text-xs">
                            {b.id.toString()}
                          </td>
                          <td className="py-3 px-2 font-medium text-white">
                            {b.studentName}
                          </td>
                          <td className="py-3 px-2 text-zinc-300">
                            {b.studentContact}
                          </td>
                          <td className="py-3 px-2 text-zinc-300">
                            {b.seatId.toString()}
                          </td>
                          <td className="py-3 px-2">
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded ${
                                b.timeSlot === "full-day"
                                  ? "bg-purple-900/50 text-purple-300"
                                  : "bg-blue-900/50 text-blue-300"
                              }`}
                            >
                              {b.timeSlot === "full-day"
                                ? "Full Day"
                                : "Half Day"}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-zinc-300 text-xs">
                            {b.bookingDate}
                          </td>
                          <td className="py-3 px-2 text-zinc-300 text-xs">
                            {b.expiryDate}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex flex-col gap-1">
                              <Badge
                                className={`text-xs ${paymentBadgeClass(b.paymentStatus)}`}
                              >
                                {b.paymentStatus}
                              </Badge>
                              {b.paymentStatus === PaymentStatus.pending && (
                                <button
                                  type="button"
                                  onClick={() => handleApprove(b.id)}
                                  disabled={!!actionLoading}
                                  className="text-xs px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded transition-colors"
                                  data-ocid={`admin.approve.button.${idx + 1}`}
                                >
                                  {isLoading("approve")
                                    ? "..."
                                    : "\u2713 Approve"}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex flex-wrap gap-1">
                              <button
                                type="button"
                                onClick={() => handleApprove(b.id)}
                                disabled={
                                  !!actionLoading ||
                                  b.paymentStatus === PaymentStatus.paid
                                }
                                className="text-xs px-2 py-1 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white rounded"
                                data-ocid={`admin.bookings.approve.button.${idx + 1}`}
                              >
                                {isLoading("approve") ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  "Approve"
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(b.id)}
                                disabled={!!actionLoading}
                                className="text-xs px-2 py-1 bg-red-700 hover:bg-red-600 disabled:opacity-40 text-white rounded"
                                data-ocid={`admin.bookings.reject.button.${idx + 1}`}
                              >
                                {isLoading("reject") ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  "Reject"
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(b.id, b.studentName)
                                }
                                disabled={!!actionLoading}
                                className="text-xs px-2 py-1 bg-zinc-600 hover:bg-zinc-500 disabled:opacity-40 text-white rounded"
                                data-ocid={`admin.bookings.delete.button.${idx + 1}`}
                              >
                                {isLoading("delete") ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  "Remove"
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setMsgBookingId(b.id);
                                  setMsgText("");
                                }}
                                className="text-xs px-2 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded"
                                data-ocid={`admin.bookings.message.button.${idx + 1}`}
                              >
                                Message
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* TAB: ROOMS */}
          <TabsContent value="rooms">
            <h2 className="font-display text-xl font-bold text-white mb-4">
              Rooms
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {rooms.map((room) => {
                const roomSeats = seats.filter((s) => s.roomId === room.id);
                const avail = roomSeats.filter((s) => s.isAvailable).length;
                return (
                  <div
                    key={room.id.toString()}
                    className="bg-zinc-900 border border-zinc-700 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-display text-xl font-bold text-amber-400">
                        {room.name}
                      </h3>
                      {room.isAC && (
                        <span className="text-xs bg-blue-900/50 text-blue-300 border border-blue-700 rounded-full px-2 py-0.5">
                          AC
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-400 text-sm mb-4">
                      {room.description}
                    </p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-zinc-800 rounded-lg p-3">
                        <div className="text-xl font-bold text-white">
                          {Number(room.capacity)}
                        </div>
                        <div className="text-xs text-zinc-500">Total</div>
                      </div>
                      <div className="bg-zinc-800 rounded-lg p-3">
                        <div className="text-xl font-bold text-emerald-400">
                          {avail}
                        </div>
                        <div className="text-xs text-zinc-500">Available</div>
                      </div>
                      <div className="bg-zinc-800 rounded-lg p-3">
                        <div className="text-xl font-bold text-red-400">
                          {Number(room.capacity) - avail}
                        </div>
                        <div className="text-xs text-zinc-500">Booked</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {rooms.length === 0 && (
                <p
                  className="text-zinc-500 col-span-2"
                  data-ocid="admin.rooms.empty_state"
                >
                  No rooms loaded yet.
                </p>
              )}
            </div>
          </TabsContent>

          {/* TAB: SEATS */}
          <TabsContent value="seats">
            <h2 className="font-display text-xl font-bold text-white mb-4">
              All Seats ({seats.length})
            </h2>
            <div className="flex gap-4 mb-4 text-sm">
              {[
                { color: "bg-emerald-500", label: "Available" },
                { color: "bg-amber-400", label: "Half-Day Booked" },
                { color: "bg-red-400", label: "Fully Booked" },
              ].map((l) => (
                <div
                  key={l.label}
                  className="flex items-center gap-1.5 text-zinc-300"
                >
                  <div className={`w-3 h-3 rounded-sm ${l.color}`} />
                  {l.label}
                </div>
              ))}
            </div>
            {seats.length === 0 ? (
              <p className="text-zinc-500" data-ocid="admin.seats.empty_state">
                Loading seats...
              </p>
            ) : (
              rooms.map((room) => (
                <div key={room.id.toString()} className="mb-8">
                  <h3 className="font-display text-lg font-semibold text-amber-400 mb-3">
                    {room.name}
                  </h3>
                  <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1.5">
                    {seats
                      .filter((s) => s.roomId === room.id)
                      .map((seat) => {
                        const status = getSeatStatus(seat.id);
                        return (
                          <div
                            key={seat.id.toString()}
                            className={`h-8 rounded text-xs font-medium flex items-center justify-center ${
                              status === "green"
                                ? "bg-emerald-700 text-emerald-100"
                                : status === "amber"
                                  ? "bg-amber-500 text-zinc-900"
                                  : "bg-red-700 text-red-100"
                            }`}
                            title={`Seat ${seat.seatNumber}`}
                          >
                            {seat.seatNumber}
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* TAB: REVENUE */}
          <TabsContent value="revenue">
            <h2 className="font-display text-xl font-bold text-white mb-6">
              Revenue Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
                <p className="text-xs text-zinc-400 uppercase tracking-wide mb-2">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold font-display text-amber-400">
                  {formatINR(analytics.totalRevenue)}
                </p>
              </div>
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
                <p className="text-xs text-zinc-400 uppercase tracking-wide mb-2">
                  This Month
                </p>
                <p className="text-3xl font-bold font-display text-white">
                  {formatINR(analytics.monthRevenue)}
                </p>
              </div>
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
                <p className="text-xs text-zinc-400 uppercase tracking-wide mb-2">
                  This Week
                </p>
                <p className="text-3xl font-bold font-display text-white">
                  {formatINR(analytics.thisWeekRev)}
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
                <p className="text-xs text-zinc-400 uppercase tracking-wide mb-4">
                  Half Day Bookings
                </p>
                <p className="text-4xl font-bold text-blue-400 mb-1">
                  {analytics.halfDayCount}
                </p>
                <p className="text-zinc-400 text-sm">
                  bookings \u00d7 \u20b9600 ={" "}
                  <span className="text-white font-semibold">
                    {formatINR(analytics.halfDayRev)}
                  </span>
                </p>
              </div>
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
                <p className="text-xs text-zinc-400 uppercase tracking-wide mb-4">
                  Full Day Bookings
                </p>
                <p className="text-4xl font-bold text-purple-400 mb-1">
                  {analytics.fullDayCount}
                </p>
                <p className="text-zinc-400 text-sm">
                  bookings \u00d7 \u20b91,200 ={" "}
                  <span className="text-white font-semibold">
                    {formatINR(analytics.fullDayRev)}
                  </span>
                </p>
              </div>
            </div>
            {analytics.total === 0 && (
              <div
                className="mt-8 text-center text-zinc-500"
                data-ocid="admin.revenue.empty_state"
              >
                No confirmed bookings yet. Revenue will appear here once
                bookings are approved.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Message dialog */}
      <Dialog
        open={!!msgBookingId}
        onOpenChange={(open) => {
          if (!open) setMsgBookingId(null);
        }}
      >
        <DialogContent
          className="bg-zinc-900 border-zinc-700 text-white"
          data-ocid="admin.message.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-white">
              Send Message to Student
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-zinc-300">Message</Label>
              <Textarea
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                placeholder="Type your message to the student..."
                className="mt-1 bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-500 min-h-24"
                data-ocid="admin.message.textarea"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={msgSending || !msgText.trim()}
              className="w-full bg-amber-400 text-zinc-900 hover:bg-amber-300"
              data-ocid="admin.message.submit_button"
            >
              {msgSending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Send Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
