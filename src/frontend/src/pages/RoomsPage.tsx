import { Skeleton } from "@/components/ui/skeleton";
import { useRooms, useSeats } from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Thermometer, Users } from "lucide-react";

export function RoomsPage() {
  const { data: rooms = [], isLoading: roomsLoading } = useRooms();
  const { data: seats = [], isLoading: seatsLoading } = useSeats();

  const loading = roomsLoading || seatsLoading;

  const getAvailableCount = (roomId: bigint) =>
    seats.filter((s) => s.roomId === roomId && s.isAvailable).length;

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative min-h-[45vh] flex items-center text-white overflow-hidden">
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
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-white/90 font-medium">
              Premium Study Spaces
            </span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
            Study <span className="text-amber-400">Rooms</span>
          </h1>
          <p className="text-lg text-white/70 max-w-xl">
            Two air-conditioned halls with 80 premium seats. Choose your room
            and book your preferred seat.
          </p>
        </div>
      </section>

      {/* Room Cards */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-card rounded-xl border border-border p-8"
                >
                  <Skeleton className="h-6 w-32 mb-3 bg-secondary" />
                  <Skeleton className="h-4 w-48 mb-6 bg-secondary" />
                  <Skeleton className="h-20 w-full mb-6 bg-secondary" />
                  <Skeleton className="h-10 w-full bg-secondary" />
                </div>
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-20" data-ocid="rooms.empty_state">
              <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg">
                Rooms are being set up. Please try again in a moment.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {rooms.map((room, idx) => {
                const available = getAvailableCount(room.id);
                const capacity = Number(room.capacity);
                const booked = capacity - available;
                const pct =
                  capacity > 0 ? Math.round((booked / capacity) * 100) : 0;

                return (
                  <div
                    key={room.id.toString()}
                    className="bg-card rounded-xl border border-border p-8 shadow-lg shadow-black/20 hover:border-primary/40 hover:shadow-primary/10 transition-all duration-300 group"
                    data-ocid={`rooms.item.${idx + 1}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="font-display text-2xl font-bold text-foreground">
                          {room.name}
                        </h2>
                        <p className="text-muted-foreground text-sm mt-1">
                          {room.description}
                        </p>
                      </div>
                      {room.isAC && (
                        <span className="flex items-center gap-1 text-xs bg-primary/20 text-primary border border-primary/30 rounded-full px-3 py-1 font-medium">
                          <Thermometer className="w-3 h-3" /> AC
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-secondary rounded-lg p-3 text-center border border-border">
                        <div className="text-2xl font-bold text-foreground">
                          {capacity}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Total Seats
                        </div>
                      </div>
                      <div className="bg-emerald-500/10 rounded-lg p-3 text-center border border-emerald-500/20">
                        <div className="text-2xl font-bold text-emerald-400">
                          {available}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Available
                        </div>
                      </div>
                    </div>

                    {/* Occupancy bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Occupancy</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>
                          {booked} / {capacity} booked
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {room.condition}
                      </span>
                    </div>

                    <Link
                      to="/rooms/$roomId"
                      params={{ roomId: room.id.toString() }}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white font-semibold rounded-md hover:bg-primary/80 transition-colors shadow-md shadow-primary/20 group-hover:shadow-primary/40"
                      data-ocid={`rooms.book.button.${idx + 1}`}
                    >
                      View Seats <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
