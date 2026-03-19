import { useActor } from "@/hooks/useActor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useRooms() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRooms();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSeats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["seats"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getSeats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSeatsByRoom(roomId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["seats", roomId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSeatsByRoom(roomId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBookings() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBookingsByDate(date: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["bookings", "date", date],
    queryFn: async () => {
      if (!actor || !date) return [];
      return actor.getBookingsByDate(date);
    },
    enabled: !!actor && !isFetching && !!date,
  });
}

export function useBookedSeatIds(date: string, timeSlot: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["bookedSeatIds", date, timeSlot],
    queryFn: async () => {
      if (!actor || !date) return [];
      return actor.getBookedSeatIds(date, timeSlot);
    },
    enabled: !!actor && !isFetching && !!date,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// Calls _initialize() on startup to seed rooms and seats if not already done
export function useInitialize() {
  const { actor, isFetching } = useActor();
  useEffect(() => {
    if (actor && !isFetching) {
      actor._initialize().catch(() => {
        // silently ignore if already initialized or error
      });
    }
  }, [actor, isFetching]);
}

export function useCreateBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      seatId: bigint;
      studentName: string;
      studentContact: string;
      bookingDate: string;
      timeSlot: string;
      bookingDuration: string;
      upiTransactionId: string;
      amount: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createBooking(
        params.seatId,
        params.studentName,
        params.studentContact,
        params.bookingDate,
        params.timeSlot,
        params.bookingDuration,
        params.upiTransactionId,
        params.amount,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookedSeatIds"] });
      queryClient.invalidateQueries({ queryKey: ["seatAvailable"] });
    },
  });
}

export function useCancelBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.cancelBooking(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookedSeatIds"] });
      queryClient.invalidateQueries({ queryKey: ["seats"] });
    },
  });
}

export function useApproveBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.approveBooking(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useRejectBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.rejectBooking(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useCreateRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      description: string;
      isAC: boolean;
      capacity: bigint;
      condition: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).createRoom(
        params.name,
        params.description,
        params.isAC,
        params.capacity,
        params.condition,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}

export function useUpdateRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      name: string;
      description: string;
      isAC: boolean;
      capacity: bigint;
      condition: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).updateRoom(
        params.id,
        params.name,
        params.description,
        params.isAC,
        params.capacity,
        params.condition,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}

export function useDeleteRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).deleteRoom(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["seats"] });
    },
  });
}
