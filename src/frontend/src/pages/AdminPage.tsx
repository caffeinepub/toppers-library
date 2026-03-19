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
  useBookedSeatIds,
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
      <Badge className="bg-green-100 text-green-700 border-green-300 text-xs capitalize font-semibold">
        ✓ Confirmed
      </Badge>
    );
  }
  if (status === "rejected") {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-300 text-xs capitalize font-semibold">
        ✗ Rejected
      </Badge>
    );
  }
  return (
    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 text-xs capitalize font-semibold">
      ⏳ Pending
    </Badge>
  );
}

function SlotBadge({ slot }: { slot: string }) {
  const colors: Record<string, string> = {
    morning: "bg-sky-900/30 text-sky-400 border-sky-700/40",
    afternoon: "bg-orange-900/30 text-orange-400 border-orange-700/40",
    evening: "bg-purple-900/30 text-purple-400 border-purple-700/40",
  };
  return (
    <Badge
      className={`text-xs capitalize ${colors[slot] ?? "bg-muted text-foreground"}`}
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
        className="relative overflow-hidden border-border shadow-navy-sm hover:shadow-navy-md transition-shadow"
        data-ocid={ocid}
      >
        <div
          className={`absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8 opacity-10 ${accent}`}
        />
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Icon className="w-4 h-4" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-foreground font-display">
            {value}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function RoomSeatsRow({
  room,
  dateFilter,
  slotFilter,
}: {
  room: Room;
  dateFilter: string;
  slotFilter: string;
}) {
  const { data: seats } = useSeatsByRoom(room.id);
  const { data: bookedIds } = useBookedSeatIds(
    dateFilter || new Date().toISOString().split("T")[0],
    slotFilter || "morning",
  );

  const total = seats?.length ?? 0;
  const booked = bookedIds
    ? (seats?.filter((s) => bookedIds.some((bid) => bid === s.id)).length ?? 0)
    : 0;
  const available = total - booked;
  const pct = total > 0 ? Math.round((available / total) * 100) : 0;

  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3">
        {room.isAC ? (
          <div className="w-9 h-9 rounded-lg bg-sky-900/30 flex items-center justify-center">
            <Wind className="w-4 h-4 text-sky-400" />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
            <Sofa className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
        <div>
          <p className="font-semibold text-sm">{room.name}</p>
          <p className="text-xs text-muted-foreground">{room.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-bold text-foreground">
            {available}{" "}
            <span className="text-muted-foreground font-normal">/ {total}</span>
          </p>
          <p className="text-xs text-muted-foreground">available</p>
        </div>
        <div className="w-20">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 text-right">
            {pct}%
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Dashboard (all hooks live here, no early returns before hooks) ────
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
  const [seatsDate, setSeatsDate] = useState("");
  const [seatsSlot, setSeatsSlot] = useState("morning");
  const [adminMessageInputs, setAdminMessageInputs] = useState<
    Record<string, string>
  >({});

  const { data: filteredBookings } = useBookingsByDate(dateFilter);

  const [roomDialog, setRoomDialog] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomForm, setRoomForm] = useState<RoomFormState>(defaultForm);

  // Derived stats
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
  const dailyRevenue = approvedBookings
    .filter((b) => b.bookingDuration === "daily")
    .reduce((sum, b) => sum + Number(b.amount), 0);
  const monthlyRevenue = approvedBookings
    .filter((b) => b.bookingDuration === "monthly")
    .reduce((sum, b) => sum + Number(b.amount), 0);

  // Weekly revenue
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyRevenue = approvedBookings
    .filter((b) => new Date(b.bookingDate) >= weekAgo)
    .reduce((sum, b) => sum + Number(b.amount), 0);

  // Monthly revenue (current calendar month)
  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthRevenue = approvedBookings
    .filter((b) => b.bookingDate.startsWith(thisMonth))
    .reduce((sum, b) => sum + Number(b.amount), 0);

  // Booked seats count
  const bookedSeatsCount = approvedBookings.length;

  // Daily data for last 14 days
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
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-navy-800 py-10 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-gold-500" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold text-white">
                  Admin Dashboard
                </h1>
                <p className="text-navy-200 text-sm mt-0.5">
                  Toppers Library — Management Console
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-navy-300 text-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </div>
              <Button
                variant="outline"
                size="sm"
                data-ocid="admin.secondary_button"
                onClick={onLogout}
                className="border-navy-500 text-navy-100 hover:bg-navy-700 hover:text-white flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard">
          <TabsList className="mb-8 bg-muted h-auto p-1 flex-wrap gap-1">
            <TabsTrigger
              value="dashboard"
              className="flex items-center gap-1.5 text-sm"
              data-ocid="admin.dashboard.tab"
            >
              <TrendingUp className="w-4 h-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="bookings"
              className="flex items-center gap-1.5 text-sm"
              data-ocid="admin.bookings.tab"
            >
              <BookOpen className="w-4 h-4" /> Bookings
            </TabsTrigger>
            <TabsTrigger
              value="rooms"
              className="flex items-center gap-1.5 text-sm"
              data-ocid="admin.rooms.tab"
            >
              <Wind className="w-4 h-4" /> Rooms
            </TabsTrigger>
            <TabsTrigger
              value="seats"
              className="flex items-center gap-1.5 text-sm"
              data-ocid="admin.seats.tab"
            >
              <Users className="w-4 h-4" /> Seats
            </TabsTrigger>
            <TabsTrigger
              value="revenue"
              className="flex items-center gap-1.5 text-sm"
              data-ocid="admin.revenue.tab"
            >
              <IndianRupee className="w-4 h-4" /> Revenue
            </TabsTrigger>
          </TabsList>

          {/* ─── DASHBOARD TAB ─── */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Bookings Today"
                value={todaysBookings.length}
                icon={BookOpen}
                accent="bg-navy-700"
                ocid="admin.stats.total_bookings.card"
              />
              <StatCard
                title="Pending Approvals"
                value={pendingBookings.length}
                icon={Clock}
                accent="bg-amber-400"
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
                accent="bg-sky-500"
                ocid="admin.stats.seats.card"
              />
              <StatCard
                title="This Week"
                value={`₹${weeklyRevenue.toLocaleString("en-IN")}`}
                icon={IndianRupee}
                accent="bg-violet-500"
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
            </div>

            <div className="bg-card rounded-xl border border-border shadow-navy-sm overflow-hidden mb-6">
              <div className="p-5 border-b border-border">
                <h2 className="font-display text-lg font-semibold">
                  Daily Usage — Last 14 Days
                </h2>
                <p className="text-muted-foreground text-sm mt-0.5">
                  Bookings and revenue by day
                </p>
              </div>
              <div className="p-5">
                <ChartContainer
                  config={{
                    bookings: { label: "Bookings", color: "#1a1a1a" },
                    revenue: { label: "Revenue (₹)", color: "#10b981" },
                  }}
                  className="h-52 w-full"
                >
                  <BarChart
                    data={last14Days}
                    margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="bookings"
                      name="Bookings"
                      fill="#1a1a1a"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="revenue"
                      name="Revenue (₹)"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
                {last14Days.every((d) => d.bookings === 0) && (
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    No bookings in the last 14 days — chart will populate as
                    bookings come in
                  </p>
                )}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-navy-sm overflow-hidden">
              <div className="p-5 border-b border-border">
                <h2 className="font-display text-lg font-semibold">
                  Recent Bookings
                </h2>
                <p className="text-muted-foreground text-sm mt-0.5">
                  Latest activity requiring your attention
                </p>
              </div>
              {bookingsLoading ? (
                <div className="p-5 space-y-3" data-ocid="admin.loading_state">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : recentBookings.length === 0 ? (
                <div
                  className="p-10 text-center text-muted-foreground"
                  data-ocid="admin.bookings.empty_state"
                >
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>No bookings yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  <AnimatePresence>
                    {recentBookings.map((booking, i) => (
                      <motion.div
                        key={booking.id.toString()}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 hover:bg-muted/30 transition-colors"
                        data-ocid={`admin.booking.row.${i + 1}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                            {booking.studentName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">
                              {booking.studentName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Seat #{booking.seatId.toString()} ·{" "}
                              {booking.bookingDate} ·{" "}
                              <span className="capitalize">
                                {booking.timeSlot}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pl-12 sm:pl-0">
                          <span className="font-semibold text-sm">
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
                                className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-2 text-xs"
                                data-ocid={`admin.booking.approve_button.${i + 1}`}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleRejectBooking(
                                    booking.id,
                                    booking.studentName,
                                  )
                                }
                                disabled={rejectBooking.isPending}
                                className="h-7 px-2 text-xs"
                                data-ocid={`admin.booking.reject_button.${i + 1}`}
                              >
                                <XCircle className="w-3 h-3 mr-1" /> Reject
                              </Button>
                            </div>
                          )}
                          {(booking.paymentStatus as string) === "approved" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelBooking(booking.id)}
                              disabled={cancelBooking.isPending}
                              className="h-7 px-2 text-xs"
                              data-ocid={`admin.booking.cancel_button.${i + 1}`}
                            >
                              Cancel
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleDeleteBooking(
                                booking.id,
                                booking.studentName,
                              )
                            }
                            disabled={deleteBooking.isPending}
                            className="h-7 px-2 text-xs border-gray-400 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            data-ocid={`admin.booking.delete_button.${i + 1}`}
                          >
                            Remove
                          </Button>
                          {(booking.paymentStatus as string) === "pending" && (
                            <div className="flex items-center gap-1 mt-1">
                              <Input
                                value={
                                  adminMessageInputs[booking.id.toString()] ??
                                  ""
                                }
                                onChange={(e) =>
                                  setAdminMessageInputs((prev) => ({
                                    ...prev,
                                    [booking.id.toString()]: e.target.value,
                                  }))
                                }
                                placeholder="Send message to student…"
                                className="h-7 text-xs"
                              />
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleSendAdminMessage(
                                    booking.id,
                                    booking.studentName,
                                  )
                                }
                                className="bg-blue-600 hover:bg-blue-700 text-white h-7 px-2 text-xs shrink-0"
                              >
                                <Send className="w-3 h-3 mr-1" /> Send
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

          {/* ─── BOOKINGS TAB ─── */}
          <TabsContent value="bookings">
            <div className="bg-card rounded-xl border border-border shadow-navy-sm overflow-hidden">
              <div className="p-5 border-b border-border">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-xl font-semibold">
                      All Bookings
                    </h2>
                    <p className="text-muted-foreground text-sm mt-0.5">
                      {displayBookings.length} bookings · ₹
                      {filteredRevenue.toLocaleString("en-IN")} collected
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-40 text-sm h-9"
                      data-ocid="admin.date.input"
                    />
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger
                        className="w-36 h-9 text-sm"
                        data-ocid="admin.filter.select"
                      >
                        <SelectValue placeholder="Payment status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={roomFilter} onValueChange={setRoomFilter}>
                      <SelectTrigger className="w-36 h-9 text-sm">
                        <SelectValue placeholder="All rooms" />
                      </SelectTrigger>
                      <SelectContent>
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
                        variant="ghost"
                        onClick={() => {
                          setDateFilter("");
                          setStatusFilter("all");
                          setRoomFilter("all");
                        }}
                        className="h-9"
                      >
                        <X className="w-4 h-4 mr-1" /> Clear
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
                <div className="px-5 py-3 text-center">
                  <p className="text-xl font-bold text-foreground font-display">
                    {displayBookings.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="px-5 py-3 text-center">
                  <p className="text-xl font-bold text-amber-600 font-display">
                    {
                      displayBookings.filter(
                        (b) => (b.paymentStatus as string) === "pending",
                      ).length
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div className="px-5 py-3 text-center">
                  <p className="text-xl font-bold text-emerald-600 font-display">
                    ₹{filteredRevenue.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
              </div>

              {bookingsLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="whitespace-nowrap">
                          Student
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Contact
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Seat
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Room
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Date
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Expiry
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Slot
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Amount
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          UPI Txn
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Payment
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Status
                        </TableHead>
                        <TableHead className="text-right whitespace-nowrap">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayBookings.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={12}
                            className="text-center text-muted-foreground py-12"
                            data-ocid="admin.bookings.empty_state"
                          >
                            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
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
                              className="hover:bg-muted/20"
                            >
                              <TableCell className="font-medium whitespace-nowrap">
                                {booking.studentName}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {booking.studentContact}
                              </TableCell>
                              <TableCell className="text-sm font-mono">
                                #{booking.seatId.toString()}
                              </TableCell>
                              <TableCell className="text-sm whitespace-nowrap">
                                {room?.name ?? `Room ${booking.roomId}`}
                              </TableCell>
                              <TableCell className="text-sm whitespace-nowrap">
                                {booking.bookingDate}
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                {booking.expiryDate || "—"}
                              </TableCell>
                              <TableCell>
                                <SlotBadge slot={booking.timeSlot} />
                              </TableCell>
                              <TableCell className="font-semibold text-sm">
                                ₹{booking.amount.toString()}
                              </TableCell>
                              <TableCell className="font-mono text-xs max-w-[100px] truncate text-muted-foreground">
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
                                <Badge
                                  variant={
                                    (booking.status as string) === "active"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="capitalize text-xs"
                                >
                                  {booking.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
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
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-2 text-xs"
                                        data-ocid={`admin.booking.approve_button.${i + 1}`}
                                      >
                                        <CheckCircle className="w-3 h-3 mr-1" />{" "}
                                        Approve
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() =>
                                          handleRejectBooking(
                                            booking.id,
                                            booking.studentName,
                                          )
                                        }
                                        disabled={rejectBooking.isPending}
                                        className="h-7 px-2 text-xs"
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
                                      variant="outline"
                                      onClick={() =>
                                        handleCancelBooking(booking.id)
                                      }
                                      disabled={cancelBooking.isPending}
                                      className="h-7 px-2 text-xs"
                                      data-ocid={`admin.booking.cancel_button.${i + 1}`}
                                    >
                                      Cancel
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleDeleteBooking(
                                        booking.id,
                                        booking.studentName,
                                      )
                                    }
                                    disabled={deleteBooking.isPending}
                                    className="h-7 px-2 text-xs border-gray-400 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                    data-ocid={`admin.booking.delete_button.${i + 1}`}
                                  >
                                    Remove
                                  </Button>
                                  {(booking.paymentStatus as string) ===
                                    "pending" && (
                                    <div className="flex items-center gap-1 mt-1">
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
                                        placeholder="Send message…"
                                        className="h-7 text-xs"
                                      />
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          handleSendAdminMessage(
                                            booking.id,
                                            booking.studentName,
                                          )
                                        }
                                        className="bg-blue-600 hover:bg-blue-700 text-white h-7 px-2 text-xs shrink-0"
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

          {/* ─── ROOMS TAB ─── */}
          <TabsContent value="rooms">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold">
                  Manage Rooms
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {rooms?.length ?? 0} rooms configured
                </p>
              </div>
              <Button
                onClick={openAddRoom}
                className="bg-primary text-primary-foreground"
                data-ocid="admin.add_room.button"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Room
              </Button>
            </div>

            {roomsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            ) : !rooms || rooms.length === 0 ? (
              <div
                className="text-center py-16 text-muted-foreground"
                data-ocid="admin.rooms.empty_state"
              >
                <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No rooms yet. Add your first room.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map((room, i) => {
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
                        className="border-border shadow-navy-sm hover:shadow-navy-md transition-shadow h-full"
                        data-ocid={`admin.room.card.${i + 1}`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {room.isAC ? (
                                <div className="w-10 h-10 rounded-xl bg-sky-900/30 flex items-center justify-center flex-shrink-0">
                                  <Wind className="w-5 h-5 text-sky-400" />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                                  <Sofa className="w-5 h-5 text-muted-foreground" />
                                </div>
                              )}
                              <CardTitle className="font-display text-base leading-tight">
                                {room.name}
                              </CardTitle>
                            </div>
                            {room.isAC && (
                              <Badge className="bg-sky-900/30 text-sky-400 border-sky-700/40 text-xs flex-shrink-0">
                                AC
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {room.description || "No description"}
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-muted/50 rounded-lg p-2 text-center">
                              <p className="font-bold text-lg font-display">
                                {room.capacity.toString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Capacity
                              </p>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-2 text-center">
                              <p className="font-bold text-lg font-display">
                                {roomSeats.length}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Seats
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {room.condition}
                            </Badge>
                            <div className="flex gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditRoom(room)}
                                className="h-8 w-8 p-0"
                                data-ocid={`admin.room.edit_button.${i + 1}`}
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteRoom(room.id)}
                                className="h-8 w-8 p-0"
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

          {/* ─── SEATS TAB ─── */}
          <TabsContent value="seats">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold">
                Seat Availability
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Check availability by date and slot
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-muted/40 rounded-xl border border-border">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium whitespace-nowrap">
                  Date
                </Label>
                <Input
                  type="date"
                  value={seatsDate}
                  onChange={(e) => setSeatsDate(e.target.value)}
                  className="w-40 h-9 text-sm"
                  data-ocid="admin.date.input"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Slot</Label>
                <Select value={seatsSlot} onValueChange={setSeatsSlot}>
                  <SelectTrigger
                    className="w-36 h-9 text-sm"
                    data-ocid="admin.filter.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (6AM-12PM)</SelectItem>
                    <SelectItem value="afternoon">
                      Afternoon (12PM-6PM)
                    </SelectItem>
                    <SelectItem value="evening">Evening (6PM-10PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {!seatsDate && (
                <p className="text-xs text-muted-foreground">
                  Showing availability for today by default
                </p>
              )}
            </div>

            {roomsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {rooms?.map((room) => (
                  <RoomSeatsRow
                    key={room.id.toString()}
                    room={room}
                    dateFilter={seatsDate}
                    slotFilter={seatsSlot}
                  />
                ))}
              </div>
            )}

            <div className="mt-8 bg-card rounded-xl border border-border shadow-navy-sm overflow-hidden">
              <div className="p-5 border-b border-border">
                <h3 className="font-display text-lg font-semibold">
                  All Seats
                </h3>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Seat #</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Base Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!seats || seats.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-10 text-muted-foreground"
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
                            className="hover:bg-muted/20"
                          >
                            <TableCell className="font-mono font-semibold">
                              {seat.seatNumber}
                            </TableCell>
                            <TableCell>
                              {room?.name ?? `Room ${seat.roomId.toString()}`}
                            </TableCell>
                            <TableCell className="capitalize">
                              {seat.seatType}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  seat.isAvailable
                                    ? "bg-emerald-900/30 text-emerald-400 border-emerald-700/40"
                                    : "bg-red-900/30 text-red-400 border-red-700/40"
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

          {/* ─── REVENUE TAB ─── */}
          <TabsContent value="revenue">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold">
                Revenue Overview
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Payment collection summary
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <Card className="border-border shadow-navy-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />{" "}
                    Approved Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-emerald-600 font-display">
                    ₹{totalRevenue.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {approvedBookings.length} approved payments
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border shadow-navy-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" /> Pending Amount
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-amber-600 font-display">
                    ₹
                    {pendingBookings
                      .reduce((s, b) => s + Number(b.amount), 0)
                      .toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {pendingBookings.length} pending approvals
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border shadow-navy-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" /> Rejected Count
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-red-500 font-display">
                    {allBookings?.filter(
                      (b) => (b.paymentStatus as string) === "rejected",
                    ).length ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    rejected payments
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <Card className="border-border shadow-navy-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Daily Bookings Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground font-display">
                    ₹{dailyRevenue.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {
                      approvedBookings.filter(
                        (b) => b.bookingDuration === "daily",
                      ).length
                    }{" "}
                    daily bookings
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border shadow-navy-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Monthly Bookings Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-600 font-display">
                    ₹{monthlyRevenue.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {
                      approvedBookings.filter(
                        (b) => b.bookingDuration === "monthly",
                      ).length
                    }{" "}
                    monthly bookings
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-navy-sm overflow-hidden">
              <div className="p-5 border-b border-border">
                <h3 className="font-display text-lg font-semibold">
                  Approved Payments
                </h3>
              </div>
              {bookingsLoading ? (
                <div className="p-5 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : approvedBookings.length === 0 ? (
                <div
                  className="p-10 text-center text-muted-foreground"
                  data-ocid="admin.revenue.empty_state"
                >
                  <IndianRupee className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>No approved payments yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead>Student</TableHead>
                        <TableHead>Seat</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Slot</TableHead>
                        <TableHead>UPI Txn ID</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvedBookings.map((booking, i) => (
                        <TableRow
                          key={booking.id.toString()}
                          className="hover:bg-muted/20"
                          data-ocid={`admin.booking.row.${i + 1}`}
                        >
                          <TableCell className="font-medium">
                            {booking.studentName}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            #{booking.seatId.toString()}
                          </TableCell>
                          <TableCell className="text-sm">
                            {booking.bookingDate}
                          </TableCell>
                          <TableCell>
                            <SlotBadge slot={booking.timeSlot} />
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {booking.upiTransactionId}
                          </TableCell>
                          <TableCell className="text-right font-bold text-emerald-600">
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
        <DialogContent className="sm:max-w-lg" data-ocid="admin.room.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingRoom ? "Edit Room" : "Add New Room"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block text-sm font-medium">
                Room Name *
              </Label>
              <Input
                placeholder="e.g. AC Study Hall A"
                value={roomForm.name}
                onChange={(e) =>
                  setRoomForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-medium">
                Description
              </Label>
              <Input
                placeholder="Brief description of the room"
                value={roomForm.description}
                onChange={(e) =>
                  setRoomForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block text-sm font-medium">
                  Capacity
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={roomForm.capacity}
                  onChange={(e) =>
                    setRoomForm((p) => ({ ...p, capacity: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-sm font-medium">
                  Condition
                </Label>
                <Input
                  placeholder="Excellent / Good / Fair"
                  value={roomForm.condition}
                  onChange={(e) =>
                    setRoomForm((p) => ({ ...p, condition: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="is-ac"
                checked={roomForm.isAC}
                onCheckedChange={(v) => setRoomForm((p) => ({ ...p, isAC: v }))}
              />
              <Label htmlFor="is-ac" className="text-sm font-medium">
                Air Conditioned
              </Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setRoomDialog(false)}
              data-ocid="admin.room.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRoomSave}
              disabled={createRoom.isPending || updateRoom.isPending}
              className="bg-primary text-primary-foreground"
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

// ─── AdminPage: login gate only, no hooks after early return ─────────────────
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
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm px-4"
      >
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-xl bg-gray-900 flex items-center justify-center mb-3">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-900">
              Admin Login
            </h1>
            <p className="text-sm text-gray-500 mt-1">
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
                className="text-sm font-medium mb-1.5 block"
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
                placeholder="Enter password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {adminLoginError && (
              <div
                data-ocid="admin_login.error_state"
                className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700"
              >
                {adminLoginError}
              </div>
            )}
            <Button
              type="submit"
              data-ocid="admin_login.submit_button"
              className="w-full bg-gray-900 text-white hover:bg-gray-700"
            >
              Login
            </Button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}
