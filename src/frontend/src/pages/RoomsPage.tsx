import type { Room } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRooms } from "@/hooks/useQueries";
import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, CreditCard, Snowflake, Star, Users } from "lucide-react";
import { motion } from "motion/react";

function conditionColor(condition: string) {
  switch (condition.toLowerCase()) {
    case "excellent":
      return "bg-green-900/30 text-green-400 border-green-700/40";
    case "good":
      return "bg-blue-900/30 text-blue-400 border-blue-700/40";
    case "fair":
      return "bg-yellow-900/30 text-yellow-400 border-yellow-700/40";
    default:
      return "bg-gray-800/50 text-gray-400 border-gray-700/40";
  }
}

function RoomCard({ room, index }: { room: Room; index: number }) {
  const navigate = useNavigate();
  const ocid = `rooms.item.${index}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
      data-ocid={ocid}
      className="bg-card border border-border rounded-xl overflow-hidden shadow-navy-sm hover:shadow-navy-md transition-all group"
    >
      <div className="bg-navy-700 px-5 py-4 flex items-start justify-between">
        <div>
          <h3 className="font-display text-xl font-bold text-white">
            {room.name}
          </h3>
          {room.isAC && (
            <Badge className="mt-1.5 bg-blue-500/20 text-blue-200 border-blue-400/30 text-xs">
              <Snowflake className="w-3 h-3 mr-1" /> Air Conditioned
            </Badge>
          )}
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium border ${conditionColor(room.condition)}`}
        >
          {room.condition}
        </span>
      </div>

      <div className="p-5">
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {room.description}
        </p>

        <div className="flex items-center gap-4 text-sm mb-5">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{room.capacity.toString()} seats total</span>
          </div>
        </div>

        <Button
          className="w-full bg-navy-700 text-white hover:bg-navy-600 group-hover:bg-primary transition-colors"
          size="sm"
          onClick={() =>
            navigate({
              to: "/rooms/$roomId",
              params: { roomId: room.id.toString() },
            })
          }
        >
          View &amp; Book Seats <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
}

function PricingTable() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-card border border-border rounded-xl p-6 shadow-navy-sm mb-10"
    >
      <div className="flex items-center gap-2 mb-5">
        <CreditCard className="w-5 h-5 text-primary" />
        <h2 className="font-display text-xl font-semibold text-foreground">
          Monthly Pricing Plans
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div>
            <p className="text-base font-semibold text-blue-800">Half Day</p>
            <p className="text-sm text-blue-600">1 shift/day for 30 days</p>
            <p className="text-xs text-blue-400 mt-1">
              (Morning, Afternoon, or Evening)
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-blue-700">₹600</span>
            <span className="text-xs text-blue-500 block">/month</span>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div>
            <p className="text-base font-semibold text-blue-800">Full Day</p>
            <p className="text-sm text-blue-600">All shifts/day for 30 days</p>
            <p className="text-xs text-blue-400 mt-1">(6:00 AM – 10:00 PM)</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-blue-700">₹1,200</span>
            <span className="text-xs text-blue-500 block">/month</span>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-amber-50 border border-amber-100 rounded-lg p-3">
        <p className="text-xs text-amber-700">
          💡 Monthly plans are valid for 30 days from your booking start date.
          Best value for regular visitors!
        </p>
      </div>
    </motion.div>
  );
}

export function RoomsPage() {
  const { data: rooms, isLoading: roomsLoading } = useRooms();

  return (
    <main className="min-h-screen bg-background">
      <div className="bg-navy-800 py-14">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">
            Study Rooms
          </h1>
          <p className="text-navy-200 text-lg">
            Choose your perfect air-conditioned study space
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <PricingTable />

        {roomsLoading ? (
          <div
            data-ocid="rooms.loading_state"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {["r1", "r2", "r3"].map((k) => (
              <div
                key={k}
                className="rounded-xl overflow-hidden border border-border"
              >
                <Skeleton className="h-24 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : !rooms || rooms.length === 0 ? (
          <div data-ocid="rooms.empty_state" className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
              <Star className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              No Rooms Available
            </h3>
            <p className="text-muted-foreground">
              Check back soon — new study rooms coming shortly.
            </p>
          </div>
        ) : (
          <div
            data-ocid="rooms.list"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {rooms.map((room, i) => (
              <RoomCard key={room.id.toString()} room={room} index={i + 1} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
