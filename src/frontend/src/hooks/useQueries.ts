import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { Booking, Message, Room, Seat } from "../backend";
import { useActor } from "./useActor";
export { BookingStatus, PaymentStatus } from "../backend";

export function useInitialize() {
  const { actor, isFetching } = useActor();
  const done = useRef(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!actor || isFetching || done.current) return;
    done.current = true;
    actor
      ._initialize()
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["rooms"] });
        queryClient.invalidateQueries({ queryKey: ["seats"] });
      })
      .catch(console.error);
  }, [actor, isFetching, queryClient]);
}

export function useRooms() {
  const { actor, isFetching } = useActor();
  return useQuery<Room[]>({
    queryKey: ["rooms"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRooms();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useSeats() {
  const { actor, isFetching } = useActor();
  const { data: rooms = [] } = useRooms();
  return useQuery<Seat[]>({
    queryKey: ["seats", "all", rooms.map((r) => r.id.toString()).join(",")],
    queryFn: async () => {
      if (!actor || rooms.length === 0) return [];
      const results = await Promise.all(
        rooms.map((r) => actor.getSeatsByRoom(r.id)),
      );
      return results.flat();
    },
    enabled: !!actor && !isFetching && rooms.length > 0,
    staleTime: 10_000,
  });
}

export function useSeatsByRoom(roomId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Seat[]>({
    queryKey: ["seats", "room", roomId?.toString()],
    queryFn: async () => {
      if (!actor || roomId === null) return [];
      return actor.getSeatsByRoom(roomId);
    },
    enabled: !!actor && !isFetching && roomId !== null,
    staleTime: 10_000,
  });
}

export function useBookings() {
  const { actor, isFetching } = useActor();
  return useQuery<Booking[]>({
    queryKey: ["bookings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBookings();
    },
    enabled: !!actor && !isFetching,
    staleTime: 10_000,
  });
}

export type { Room, Seat, Booking, Message };
