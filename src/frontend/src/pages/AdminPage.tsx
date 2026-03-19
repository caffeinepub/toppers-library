import type { Room } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useApproveBooking,
  useBookedSeatIdsByRoom,
  useBookings,
  useBookingsByDate,
  useCancelBooking,
  useCreateRoom,
  useDeleteBooking,
  useDeleteRoom,
  useRejectBooking,
  useRooms,
  useSeats,
  useSeatsByRoom,
  useSendMessage,
  useUpdateRoom,
} from "@/hooks/useQueries";
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  Clock,
  Edit,
  IndianRupee,
  Loader2,
  LogOut,
  Plus,
  Send,
  ShieldCheck,
  Sofa,
  Trash2,
  TrendingUp,
  Users,
  Wind,
  X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

interface RoomFormState {
  name: string;
  description: string;
  isAC: boolean;
  capacity: string;
  condition: string;
}

const defaultForm: RoomFormState = {
  name: "",
  description: "",
  isAC: true,
  capacity: "20",
  condition: "Excellent",
};

function PaymentStatusBadge({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
        ✓ Confirmed
      </Badge>
    );
  }
  if (status === "rejected") {
    return (
      <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold">
        ✗ Rejected
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold">
      ⏳ Pending
    </Badge>
  );
}

function SlotBadge({ slot }: { slot: string }) {
  const colors: Record<string, string> = {
    halfday: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    fullday: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  };
  return (
    <Badge
      className={`text-xs capitalize border ${colors[slot] ?? "bg-zinc-700 text-zinc-300 border-zinc-600"}`}
    >
      {slot}
    </Badge>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  accent,
  ocid,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  accent: string;
  ocid: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card
        className="relative overflow-hidden bg-zinc-900 border border-zinc-800 shadow-none"
        data-ocid={ocid}
      >
        <div
          className={`absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-6 translate-x-6 opacity-20 ${accent}`}
        />
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
            <Icon className="w-3.5 h-3.5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-white font-display">{value}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function RoomSeatsRow({ room }: { room: Room }) {
  const { data: seats } = useSeatsByRoom(room.id);
  const { data: bookedIds } = useBookedSeatIdsByRoom(room.id);

  const total = seats?.length ?? 0;
  const booked = bookedIds
    ? (seats?.filter((s) => bookedIds.some((bid) => bid === s.id)).length ?? 0)
    : 0;
  const available = total - booked;
  const pct = total > 0 ? Math.round((available / total) * 100) : 0;

  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800/60 transition-colors">
      <div className="flex items-center gap-3">
        {room.isAC ? (
          <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Wind className="w-4 h-4 text-blue-400" />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center">
            <Sofa className="w-4 h-4 text-zinc-400" />
          </div>
        )}
        <div>
          <p className="font-semibold text-sm text-white">{room.name}</p>
          <p className="text-xs text-zinc-400">{room.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-bold text-white">
            {available}{" "}
            <span className="text-zinc-500 font-normal">/ {total}</span>
          </p>
          <p className="text-xs text-zinc-500">available</p>
        </div>
        <div className="w-20">
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500 mt-0.5 text-right">{pct}%</p>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { data: allBookings, isLoading: bookingsLoading } = useBookings();
  const { data: rooms, isLoading: roomsLoading } = useRooms();
  const { data: seats } = useSeats();

  const cancelBooking = useCancelBooking();
  const approveBooking = useApproveBooking();
  const rejectBooking = useRejectBooking();
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteBooking = useDeleteBooking();
  const deleteRoom = useDeleteRoom();
  const sendMessage = useSendMessage();

  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");
  const [seatsSlot, setSeatsSlot] = useState("halfday");
  const [adminMessageInputs, setAdminMessageInputs] = useState<
    Record<string, string>
  >({});

  const { data: filteredBookings } = useBookingsByDate(dateFilter);

  const [roomDialog, setRoomDialog] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomForm, setRoomForm] = useState<RoomFormState>(defaultForm);

  const today = new Date().toISOString().split("T")[0];
  const todaysBookings =
    allBookings?.filter((b) => b.bookingDate === today) ?? [];
  const pendingBookings =
    allBookings?.filter((b) => (b.paymentStatus as string) === "pending") ?? [];
  const approvedBookings =
    allBookings?.filter((b) => (b.paymentStatus as string) === "approved") ??
    [];
  const totalRevenue = approvedBookings.reduce(
    (sum, b) => sum + Number(b.amount),
    0,
  );
  const monthlyRevenue = approvedBookings
    .filter((b) => b.bookingDuration === "monthly")
    .reduce((sum, b) => sum + Number(b.amount), 0);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyRevenue = approvedBookings
    .filter((b) => new Date(b.bookingDate) >= weekAgo)
    .reduce((sum, b) => sum + Number(b.amount), 0);

  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthRevenue = approvedBookings
    .filter((b) => b.bookingDate.startsWith(thisMonth))
    .reduce((sum, b) => sum + Number(b.amount), 0);

  const bookedSeatsCount = new Set(
    approvedBookings.map((b) => b.seatId.toString()),
  ).size;

  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const dateStr = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
    const dayBookings = (allBookings ?? []).filter(
      (b) => b.bookingDate === dateStr,
    );
    const dayRevenue = dayBookings
      .filter((b) => (b.paymentStatus as string) === "approved")
      .reduce((sum, b) => sum + Number(b.amount), 0);
    return { date: label, bookings: dayBookings.length, revenue: dayRevenue };
  });

  let displayBookings = dateFilter
    ? (filteredBookings ?? [])
    : (allBookings ?? []);
  if (statusFilter !== "all") {
    displayBookings = displayBookings.filter(
      (b) => b.paymentStatus === statusFilter,
    );
  }
  if (roomFilter !== "all") {
    displayBookings = displayBookings.filter(
      (b) => b.roomId.toString() === roomFilter,
    );
  }

  const filteredRevenue = displayBookings
    .filter((b) => (b.paymentStatus as string) === "approved")
    .reduce((sum, b) => sum + Number(b.amount), 0);

  const recentBookings = [...(allBookings ?? [])]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 8);

  const openAddRoom = () => {
    setEditingRoom(null);
    setRoomForm(defaultForm);
    setRoomDialog(true);
  };

  const openEditRoom = (room: Room) => {
    setEditingRoom(room);
    setRoomForm({
      name: room.name,
      description: room.description,
      isAC: room.isAC,
      capacity: room.capacity.toString(),
      condition: room.condition,
    });
    setRoomDialog(true);
  };

  const handleRoomSave = async () => {
    if (!roomForm.name.trim()) {
      toast.error("Room name is required.");
      return;
    }
    try {
      if (editingRoom) {
        await updateRoom.mutateAsync({
          id: editingRoom.id,
          name: roomForm.name,
          description: roomForm.description,
          isAC: roomForm.isAC,
          capacity: BigInt(roomForm.capacity || 0),
          condition: roomForm.condition,
        });
        toast.success("Room updated.");
      } else {
        await createRoom.mutateAsync({
          name: roomForm.name,
          description: roomForm.description,
          isAC: roomForm.isAC,
          capacity: BigInt(roomForm.capacity || 0),
          condition: roomForm.condition,
        });
        toast.success("Room created.");
      }
      setRoomDialog(false);
    } catch {
      toast.error("Operation failed. Try again.");
    }
  };

  const handleDeleteRoom = async (id: bigint) => {
    if (!confirm("Delete this room? This cannot be undone.")) return;
    try {
      await deleteRoom.mutateAsync(id);
      toast.success("Room deleted.");
    } catch {
      toast.error("Delete failed.");
    }
  };

  const handleCancelBooking = async (id: bigint) => {
    if (!confirm("Cancel this booking?")) return;
    try {
      await cancelBooking.mutateAsync(id);
      toast.success("Booking cancelled.");
    } catch {
      toast.error("Failed to cancel booking.");
    }
  };

  const handleApproveBooking = async (id: bigint, studentName: string) => {
    try {
      await approveBooking.mutateAsync(id);
      toast.success(`Booking confirmed for ${studentName}!`);
    } catch {
      toast.error("Failed to approve booking.");
    }
  };

  const handleDeleteBooking = async (id: bigint, studentName: string) => {
    if (
      !confirm(
        `Remove student "${studentName}" and free their seat? This cannot be undone.`,
      )
    )
      return;
    try {
      await deleteBooking.mutateAsync(id);
      toast.success(`Student removed and seat freed for ${studentName}.`);
    } catch {
      toast.error("Failed to remove student.");
    }
  };

  const handleRejectBooking = async (id: bigint, studentName: string) => {
    if (!confirm(`Reject booking for ${studentName}?`)) return;
    try {
      await rejectBooking.mutateAsync(id);
      toast.success(`Booking rejected for ${studentName}.`);
    } catch {
      toast.error("Failed to reject booking.");
    }
  };

  const handleSendAdminMessage = async (
    bookingId: bigint,
    studentName: string,
  ) => {
    const msg = adminMessageInputs[bookingId.toString()] ?? "";
    if (!msg.trim()) {
      toast.error("Please type a message before sending.");
      return;
    }
    try {
      await sendMessage.mutateAsync({ bookingId, content: msg.trim() });
      toast.success(`Message sent to ${studentName}`);
      setAdminMessageInputs((prev) => ({
        ...prev,
        [bookingId.toString()]: "",
      }));
    } catch {
      toast.error("Failed to send message.");
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-white leading-tight">
                  Toppers Library
                </h1>
                <p className="text-zinc-400 text-xs">Admin Panel</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 text-zinc-400 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </div>
              <Button
                variant="outline"
                size="sm"
                data-ocid="admin.secondary_button"
                onClick={onLogout}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white bg-transparent flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard">
          <TabsList className="mb-6 bg-zinc-900 border border-zinc-800 h-auto p-1 flex-wrap gap-1">
            <TabsTrigger
              value="dashboard"
              className="flex items-center gap-1.5 text-sm text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
              data-ocid="admin.dashboard.tab"
            >
              <TrendingUp className="w-4 h-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="bookings"
              className="flex items-center gap-1.5 text-sm text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
              data-ocid="admin.bookings.tab"
            >
              <BookOpen className="w-4 h-4" /> Bookings
            </TabsTrigger>
            <TabsTrigger
              value="rooms"
              className="flex items-center gap-1.5 text-sm text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
              data-ocid="admin.rooms.tab"
            >
              <Wind className="w-4 h-4" /> Rooms
            </TabsTrigger>
            <TabsTrigger
              value="seats"
              className="flex items-center gap-1.5 text-sm text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
              data-ocid="admin.seats.tab"
            >
              <Users className="w-4 h-4" /> Seats
            </TabsTrigger>
            <TabsTrigger
              value="revenue"
              className="flex items-center gap-1.5 text-sm text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
              data-ocid="admin.revenue.tab"
            >
              <IndianRupee className="w-4 h-4" /> Revenue
            </TabsTrigger>
          </TabsList>

          {/* DASHBOARD TAB */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Today's Bookings"
                value={todaysBookings.length}
                icon={BookOpen}
                accent="bg-blue-500"
                ocid="admin.stats.total_bookings.card"
              />
              <StatCard
                title="Pending Approvals"
                value={pendingBookings.length}
                icon={Clock}
                accent="bg-amber-500"
                ocid="admin.stats.pending.card"
              />
              <StatCard
                title="Revenue Collected"
                value={`₹${totalRevenue.toLocaleString("en-IN")}`}
                icon={IndianRupee}
                accent="bg-emerald-500"
                ocid="admin.stats.revenue.card"
              />
              <StatCard
                title="Total Seats"
                value={seats?.length ?? 0}
                icon={Users}
                accent="bg-violet-500"
                ocid="admin.stats.seats.card"
              />
              <StatCard
                title="This Week"
                value={`₹${weeklyRevenue.toLocaleString("en-IN")}`}
                icon={IndianRupee}
                accent="bg-sky-500"
                ocid="admin.stats.weekly_revenue.card"
              />
              <StatCard
                title="This Month"
                value={`₹${thisMonthRevenue.toLocaleString("en-IN")}`}
                icon={IndianRupee}
                accent="bg-rose-500"
                ocid="admin.stats.monthly_revenue.card"
              />
              <StatCard
                title="Seats Booked"
                value={bookedSeatsCount}
                icon={Users}
                accent="bg-teal-500"
                ocid="admin.stats.booked_seats.card"
              />
              <StatCard
                title="Active Members"
                value={approvedBookings.length}
                icon={CheckCircle}
                accent="bg-green-500"
                ocid="admin.stats.active_members.card"
              />
            </div>

            {/* Chart */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden mb-6">
              <div className="p-5 border-b border-zinc-800">
                <h2 className="font-display text-base font-semibold text-white">
                  Daily Activity — Last 14 Days
                </h2>
                <p className="text-zinc-400 text-xs mt-0.5">
                  Bookings and revenue by day
                </p>
              </div>
              <div className="p-5">
                <ChartContainer
                  config={{
                    bookings: { label: "Bookings", color: "#f59e0b" },
                    revenue: { label: "Revenue (₹)", color: "#10b981" },
                  }}
                  className="h-52 w-full"
                >
                  <BarChart
                    data={last14Days}
                    margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#27272a"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#71717a" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#71717a" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    />
                    <Bar
                      dataKey="bookings"
                      name="Bookings"
                      fill="#f59e0b"
                      radius={[3, 3, 0, 0]}
                    />
                    <Bar
                      dataKey="revenue"
                      name="Revenue (₹)"
                      fill="#10b981"
                      radius={[3, 3, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
                {last14Days.every((d) => d.bookings === 0) && (
                  <p className="text-center text-xs text-zinc-500 mt-2">
                    No bookings in the last 14 days
                  </p>
                )}
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="p-5 border-b border-zinc-800">
                <h2 className="font-display text-base font-semibold text-white">
                  Recent Bookings
                </h2>
                <p className="text-zinc-400 text-xs mt-0.5">
                  Latest activity requiring attention
                </p>
              </div>
              {bookingsLoading ? (
                <div className="p-5 space-y-3" data-ocid="admin.loading_state">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full bg-zinc-800" />
                  ))}
                </div>
              ) : recentBookings.length === 0 ? (
                <div
                  className="p-10 text-center text-zinc-500"
                  data-ocid="admin.bookings.empty_state"
                >
                  <AlertCircle className="w-7 h-7 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No bookings yet</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800">
                  <AnimatePresence>
                    {recentBookings.map((booking, i) => (
                      <motion.div
                        key={booking.id.toString()}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 hover:bg-zinc-800/40 transition-colors"
                        data-ocid={`admin.booking.row.${i + 1}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center font-bold text-amber-400 text-sm">
                            {booking.studentName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-white">
                              {booking.studentName}
                            </p>
                            <p className="text-xs text-zinc-400">
                              Seat #{booking.seatId.toString()} ·{" "}
                              {booking.bookingDate} ·{" "}
                              <span className="capitalize">
                                {booking.timeSlot}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pl-11 sm:pl-0">
                          <span className="font-semibold text-sm text-white">
                            ₹{booking.amount.toString()}
                          </span>
                          <PaymentStatusBadge status={booking.paymentStatus} />
                          {(booking.paymentStatus as string) === "pending" && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleApproveBooking(
                                    booking.id,
                                    booking.studentName,
                                  )
                                }
                                disabled={approveBooking.isPending}
                                className="bg-amber-500 hover:bg-amber-400 text-black font-semibold h-7 px-2 text-xs"
                                data-ocid={`admin.booking.approve_button.${i + 1}`}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleRejectBooking(
                                    booking.id,
                                    booking.studentName,
                                  )
                                }
                                disabled={rejectBooking.isPending}
                                className="bg-red-600 hover:bg-red-500 text-white h-7 px-2 text-xs"
                                data-ocid={`admin.booking.reject_button.${i + 1}`}
                              >
                                <XCircle className="w-3 h-3 mr-1" /> Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </TabsContent>

          {/* BOOKINGS TAB */}
          <TabsContent value="bookings">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="p-5 border-b border-zinc-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-white">
                      All Bookings
                    </h2>
                    <p className="text-zinc-400 text-xs mt-0.5">
                      {displayBookings.length} bookings · ₹
                      {filteredRevenue.toLocaleString("en-IN")} collected
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-40 text-sm h-9 bg-zinc-800 border-zinc-700 text-white"
                      data-ocid="admin.date.input"
                    />
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger
                        className="w-36 h-9 text-sm bg-zinc-800 border-zinc-700 text-white"
                        data-ocid="admin.filter.select"
                      >
                        <SelectValue placeholder="Payment status" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-700">
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={roomFilter} onValueChange={setRoomFilter}>
                      <SelectTrigger className="w-36 h-9 text-sm bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue placeholder="All rooms" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-700">
                        <SelectItem value="all">All rooms</SelectItem>
                        {rooms?.map((r) => (
                          <SelectItem
                            key={r.id.toString()}
                            value={r.id.toString()}
                          >
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {(dateFilter ||
                      statusFilter !== "all" ||
                      roomFilter !== "all") && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9 border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
                        onClick={() => {
                          setDateFilter("");
                          setStatusFilter("all");
                          setRoomFilter("all");
                        }}
                      >
                        <X className="w-3.5 h-3.5 mr-1" /> Clear
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {bookingsLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full bg-zinc-800" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider whitespace-nowrap">
                          Student
                        </TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider whitespace-nowrap">
                          Contact
                        </TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider whitespace-nowrap">
                          Seat
                        </TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider whitespace-nowrap">
                          Room
                        </TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider whitespace-nowrap">
                          Date
                        </TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider whitespace-nowrap">
                          Expiry
                        </TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider whitespace-nowrap">
                          Slot
                        </TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider whitespace-nowrap">
                          Amount
                        </TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider whitespace-nowrap">
                          UPI Txn
                        </TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider whitespace-nowrap">
                          Payment
                        </TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider whitespace-nowrap">
                          Status
                        </TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider text-right whitespace-nowrap">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayBookings.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={12}
                            className="text-center text-zinc-500 py-12"
                            data-ocid="admin.bookings.empty_state"
                          >
                            <AlertCircle className="w-7 h-7 mx-auto mb-2 opacity-40" />
                            No bookings match the current filters
                          </TableCell>
                        </TableRow>
                      ) : (
                        displayBookings.map((booking, i) => {
                          const room = rooms?.find(
                            (r) => r.id === booking.roomId,
                          );
                          return (
                            <TableRow
                              key={booking.id.toString()}
                              data-ocid={`admin.booking.row.${i + 1}`}
                              className="border-zinc-800 hover:bg-zinc-800/40"
                            >
                              <TableCell className="font-medium text-white whitespace-nowrap">
                                {booking.studentName}
                              </TableCell>
                              <TableCell className="text-sm text-zinc-400">
                                {booking.studentContact}
                              </TableCell>
                              <TableCell className="text-sm font-mono text-zinc-300">
                                #{booking.seatId.toString()}
                              </TableCell>
                              <TableCell className="text-sm text-zinc-300 whitespace-nowrap">
                                {room?.name ?? `Room ${booking.roomId}`}
                              </TableCell>
                              <TableCell className="text-sm text-zinc-300 whitespace-nowrap">
                                {booking.bookingDate}
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-xs text-zinc-500">
                                {booking.expiryDate || "—"}
                              </TableCell>
                              <TableCell>
                                <SlotBadge slot={booking.timeSlot} />
                              </TableCell>
                              <TableCell className="font-semibold text-sm text-amber-400">
                                ₹{booking.amount.toString()}
                              </TableCell>
                              <TableCell className="font-mono text-xs max-w-[100px] truncate text-zinc-500">
                                {booking.upiTransactionId || (
                                  <span className="italic">—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <PaymentStatusBadge
                                  status={booking.paymentStatus}
                                />
                              </TableCell>
                              <TableCell>
                                <Badge className="capitalize text-xs bg-zinc-800 text-zinc-300 border-zinc-700">
                                  {booking.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex flex-col items-end gap-1">
                                  <div className="flex items-center gap-1">
                                    {(booking.paymentStatus as string) ===
                                      "pending" && (
                                      <>
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            handleApproveBooking(
                                              booking.id,
                                              booking.studentName,
                                            )
                                          }
                                          disabled={approveBooking.isPending}
                                          className="bg-amber-500 hover:bg-amber-400 text-black font-semibold h-7 px-2 text-xs"
                                          data-ocid={`admin.booking.approve_button.${i + 1}`}
                                        >
                                          <CheckCircle className="w-3 h-3 mr-1" />{" "}
                                          Approve
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            handleRejectBooking(
                                              booking.id,
                                              booking.studentName,
                                            )
                                          }
                                          disabled={rejectBooking.isPending}
                                          className="bg-red-600 hover:bg-red-500 text-white h-7 px-2 text-xs"
                                          data-ocid={`admin.booking.reject_button.${i + 1}`}
                                        >
                                          <XCircle className="w-3 h-3 mr-1" />{" "}
                                          Reject
                                        </Button>
                                      </>
                                    )}
                                    {(booking.paymentStatus as string) ===
                                      "approved" && (
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          handleCancelBooking(booking.id)
                                        }
                                        disabled={cancelBooking.isPending}
                                        className="bg-zinc-700 hover:bg-zinc-600 text-white h-7 px-2 text-xs"
                                        data-ocid={`admin.booking.cancel_button.${i + 1}`}
                                      >
                                        Cancel
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleDeleteBooking(
                                          booking.id,
                                          booking.studentName,
                                        )
                                      }
                                      disabled={deleteBooking.isPending}
                                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 h-7 px-2 text-xs border border-zinc-700"
                                      data-ocid={`admin.booking.delete_button.${i + 1}`}
                                    >
                                      <Trash2 className="w-3 h-3 mr-1" /> Remove
                                    </Button>
                                  </div>
                                  {(booking.paymentStatus as string) ===
                                    "pending" && (
                                    <div className="flex items-center gap-1">
                                      <Input
                                        value={
                                          adminMessageInputs[
                                            booking.id.toString()
                                          ] ?? ""
                                        }
                                        onChange={(e) =>
                                          setAdminMessageInputs((prev) => ({
                                            ...prev,
                                            [booking.id.toString()]:
                                              e.target.value,
                                          }))
                                        }
                                        placeholder="Message student…"
                                        className="h-7 text-xs bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
                                      />
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          handleSendAdminMessage(
                                            booking.id,
                                            booking.studentName,
                                          )
                                        }
                                        className="bg-zinc-700 hover:bg-zinc-600 text-white h-7 px-2 text-xs shrink-0"
                                      >
                                        <Send className="w-3 h-3 mr-1" /> Send
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ROOMS TAB */}
          <TabsContent value="rooms">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-xl font-bold text-white">
                  Rooms
                </h2>
                <p className="text-zinc-400 text-sm mt-1">Manage study halls</p>
              </div>
              <Button
                onClick={openAddRoom}
                className="bg-amber-500 hover:bg-amber-400 text-black font-semibold flex items-center gap-1.5"
                data-ocid="admin.add_room_button"
              >
                <Plus className="w-4 h-4" /> Add Room
              </Button>
            </div>

            {roomsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-48 w-full bg-zinc-800" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms?.map((room, i) => {
                  const roomSeats =
                    seats?.filter((s) => s.roomId === room.id) ?? [];
                  return (
                    <motion.div
                      key={room.id.toString()}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card
                        className="bg-zinc-900 border border-zinc-800"
                        data-ocid={`admin.room.card.${i + 1}`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {room.isAC ? (
                                <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                  <Wind className="w-4 h-4 text-blue-400" />
                                </div>
                              ) : (
                                <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center">
                                  <Sofa className="w-4 h-4 text-zinc-400" />
                                </div>
                              )}
                              <CardTitle className="font-display text-base text-white leading-tight">
                                {room.name}
                              </CardTitle>
                            </div>
                            {room.isAC && (
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                AC
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-zinc-400 line-clamp-2">
                            {room.description || "No description"}
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-zinc-800 rounded-lg p-2 text-center">
                              <p className="font-bold text-lg text-white">
                                {room.capacity.toString()}
                              </p>
                              <p className="text-xs text-zinc-400">Capacity</p>
                            </div>
                            <div className="bg-zinc-800 rounded-lg p-2 text-center">
                              <p className="font-bold text-lg text-white">
                                {roomSeats.length}
                              </p>
                              <p className="text-xs text-zinc-400">Seats</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 text-xs">
                              {room.condition}
                            </Badge>
                            <div className="flex gap-1.5">
                              <Button
                                size="sm"
                                onClick={() => openEditRoom(room)}
                                className="h-8 w-8 p-0 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                                data-ocid={`admin.room.edit_button.${i + 1}`}
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleDeleteRoom(room.id)}
                                className="h-8 w-8 p-0 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/30"
                                data-ocid={`admin.room.delete_button.${i + 1}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* SEATS TAB */}
          <TabsContent value="seats">
            <div className="mb-6">
              <h2 className="font-display text-xl font-bold text-white">
                Seat Availability
              </h2>
              <p className="text-zinc-400 text-sm mt-1">
                Live status across all rooms
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-zinc-300 whitespace-nowrap">
                  Slot
                </Label>
                <Select value={seatsSlot} onValueChange={setSeatsSlot}>
                  <SelectTrigger
                    className="w-40 h-9 text-sm bg-zinc-800 border-zinc-700 text-white"
                    data-ocid="admin.filter.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="halfday">Half Day</SelectItem>
                    <SelectItem value="fullday">Full Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {roomsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full bg-zinc-800" />
                ))}
              </div>
            ) : (
              <div className="space-y-3 mb-8">
                {rooms?.map((room) => (
                  <RoomSeatsRow key={room.id.toString()} room={room} />
                ))}
              </div>
            )}

            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="p-5 border-b border-zinc-800">
                <h3 className="font-display text-base font-semibold text-white">
                  All Seats
                </h3>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">
                        Seat #
                      </TableHead>
                      <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">
                        Room
                      </TableHead>
                      <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">
                        Type
                      </TableHead>
                      <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!seats || seats.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-10 text-zinc-500"
                        >
                          No seats found
                        </TableCell>
                      </TableRow>
                    ) : (
                      seats.map((seat) => {
                        const room = rooms?.find((r) => r.id === seat.roomId);
                        return (
                          <TableRow
                            key={seat.id.toString()}
                            className="border-zinc-800 hover:bg-zinc-800/40"
                          >
                            <TableCell className="font-mono font-semibold text-white">
                              {seat.seatNumber}
                            </TableCell>
                            <TableCell className="text-zinc-300">
                              {room?.name ?? `Room ${seat.roomId.toString()}`}
                            </TableCell>
                            <TableCell className="capitalize text-zinc-400">
                              {seat.seatType}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  seat.isAvailable
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                                }
                              >
                                {seat.isAvailable ? "Available" : "Occupied"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* REVENUE TAB */}
          <TabsContent value="revenue">
            <div className="mb-6">
              <h2 className="font-display text-xl font-bold text-white">
                Revenue Overview
              </h2>
              <p className="text-zinc-400 text-sm mt-1">
                Payment collection summary
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />{" "}
                    Approved Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-emerald-400 font-display">
                    ₹{totalRevenue.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {approvedBookings.length} approved payments
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> Pending
                    Amount
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-amber-400 font-display">
                    ₹
                    {pendingBookings
                      .reduce((s, b) => s + Number(b.amount), 0)
                      .toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {pendingBookings.length} pending approvals
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
                    <XCircle className="w-3.5 h-3.5 text-red-400" /> Rejected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-400 font-display">
                    {allBookings?.filter(
                      (b) => (b.paymentStatus as string) === "rejected",
                    ).length ?? 0}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    rejected payments
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mb-8">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Monthly Bookings Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-400 font-display">
                    ₹{monthlyRevenue.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {
                      approvedBookings.filter(
                        (b) => b.bookingDuration === "monthly",
                      ).length
                    }{" "}
                    monthly bookings confirmed
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="p-5 border-b border-zinc-800">
                <h3 className="font-display text-base font-semibold text-white">
                  Approved Payments
                </h3>
              </div>
              {bookingsLoading ? (
                <div className="p-5 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full bg-zinc-800" />
                  ))}
                </div>
              ) : approvedBookings.length === 0 ? (
                <div
                  className="p-10 text-center text-zinc-500"
                  data-ocid="admin.revenue.empty_state"
                >
                  <IndianRupee className="w-7 h-7 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No approved payments yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">
                          Student
                        </TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">
                          Seat
                        </TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">
                          Date
                        </TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">
                          Slot
                        </TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">
                          UPI Txn ID
                        </TableHead>
                        <TableHead className="text-zinc-400 text-xs uppercase tracking-wider text-right">
                          Amount
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvedBookings.map((booking, i) => (
                        <TableRow
                          key={booking.id.toString()}
                          className="border-zinc-800 hover:bg-zinc-800/40"
                          data-ocid={`admin.booking.row.${i + 1}`}
                        >
                          <TableCell className="font-medium text-white">
                            {booking.studentName}
                          </TableCell>
                          <TableCell className="font-mono text-sm text-zinc-300">
                            #{booking.seatId.toString()}
                          </TableCell>
                          <TableCell className="text-sm text-zinc-300">
                            {booking.bookingDate}
                          </TableCell>
                          <TableCell>
                            <SlotBadge slot={booking.timeSlot} />
                          </TableCell>
                          <TableCell className="font-mono text-xs text-zinc-500">
                            {booking.upiTransactionId}
                          </TableCell>
                          <TableCell className="text-right font-bold text-emerald-400">
                            ₹{booking.amount.toString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Room Dialog */}
      <Dialog open={roomDialog} onOpenChange={setRoomDialog}>
        <DialogContent
          className="sm:max-w-lg bg-zinc-900 border-zinc-800"
          data-ocid="admin.room.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-white">
              {editingRoom ? "Edit Room" : "Add New Room"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Room Name *
              </Label>
              <Input
                placeholder="e.g. AC Study Hall A"
                value={roomForm.name}
                onChange={(e) =>
                  setRoomForm((p) => ({ ...p, name: e.target.value }))
                }
                className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Description
              </Label>
              <Input
                placeholder="Brief description of the room"
                value={roomForm.description}
                onChange={(e) =>
                  setRoomForm((p) => ({ ...p, description: e.target.value }))
                }
                className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Capacity
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={roomForm.capacity}
                  onChange={(e) =>
                    setRoomForm((p) => ({ ...p, capacity: e.target.value }))
                  }
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Condition
                </Label>
                <Input
                  placeholder="Excellent / Good / Fair"
                  value={roomForm.condition}
                  onChange={(e) =>
                    setRoomForm((p) => ({ ...p, condition: e.target.value }))
                  }
                  className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="is-ac"
                checked={roomForm.isAC}
                onCheckedChange={(v) => setRoomForm((p) => ({ ...p, isAC: v }))}
              />
              <Label
                htmlFor="is-ac"
                className="text-sm font-medium text-zinc-300"
              >
                Air Conditioned
              </Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setRoomDialog(false)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
              data-ocid="admin.room.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRoomSave}
              disabled={createRoom.isPending || updateRoom.isPending}
              className="bg-amber-500 hover:bg-amber-400 text-black font-semibold"
              data-ocid="admin.room.save_button"
            >
              {createRoom.isPending || updateRoom.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
                </>
              ) : editingRoom ? (
                "Save Changes"
              ) : (
                "Create Room"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

export function AdminPage() {
  const [adminLoggedIn, setAdminLoggedIn] = useState(
    () => localStorage.getItem("adminLoggedIn") === "true",
  );
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminLoginError, setAdminLoginError] = useState("");

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUser === "addmin" && adminPass === "topperslibrary739") {
      localStorage.setItem("adminLoggedIn", "true");
      setAdminLoggedIn(true);
      setAdminLoginError("");
    } else {
      setAdminLoginError("Invalid username or password");
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    setAdminLoggedIn(false);
    setAdminUser("");
    setAdminPass("");
  };

  if (adminLoggedIn) {
    return <AdminDashboard onLogout={handleAdminLogout} />;
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm px-4"
      >
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">
          <div className="flex flex-col items-center mb-7">
            <div className="w-14 h-14 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-4">
              <ShieldCheck className="w-7 h-7 text-amber-400" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white">
              Admin Login
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Toppers Library — Management Console
            </p>
          </div>
          <form
            onSubmit={handleAdminLogin}
            className="space-y-4"
            data-ocid="admin_login.dialog"
          >
            <div>
              <Label
                htmlFor="admin-username"
                className="text-sm font-medium mb-1.5 block text-zinc-300"
              >
                Username
              </Label>
              <Input
                id="admin-username"
                data-ocid="admin_login.input"
                placeholder="Enter username"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                autoComplete="username"
                className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
              />
            </div>
            <div>
              <Label
                htmlFor="admin-password"
                className="text-sm font-medium mb-1.5 block text-zinc-300"
              >
                Password
              </Label>
              <Input
                id="admin-password"
                type="password"
                data-ocid="admin_login.input"
                placeholder="Enter password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                autoComplete="current-password"
                className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
              />
            </div>
            {adminLoginError && (
              <div
                data-ocid="admin_login.error_state"
                className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-400"
              >
                {adminLoginError}
              </div>
            )}
            <Button
              type="submit"
              data-ocid="admin_login.submit_button"
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold"
            >
              Login
            </Button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}
