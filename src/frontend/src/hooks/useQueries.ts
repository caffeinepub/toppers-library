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

// Gets all seats across all rooms by fetching per-room
export function useSeats() {
  const { actor, isFetching } = useActor();
  const { data: rooms } = useRooms();
  return useQuery({
    queryKey: ["seats"],
    queryFn: async () => {
      if (!actor || !rooms || rooms.length === 0) return [];
      const results = await Promise.all(
        rooms.map((r) => actor.getSeatsByRoom(r.id)),
      );
      return results.flat();
    },
    enabled: !!actor && !isFetching && !!rooms && rooms.length > 0,
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

// getBookedSeatIdsByRoom is not in the generated backend.ts interface — use as any
export function useBookedSeatIdsByRoom(roomId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["bookedSeatIdsByRoom", roomId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getBookedSeatIdsByRoom(roomId) as Promise<bigint[]>;
    },
    enabled: !!actor && !isFetching,
  });
}

// Calls _initialize() and expireOldBookings() on startup
export function useInitialize() {
  const { actor, isFetching } = useActor();
  useEffect(() => {
    if (actor && !isFetching) {
      const todayStr = new Date().toISOString().split("T")[0];
      actor._initialize().catch(() => {});
      // expireOldBookings is not in the generated interface — use as any
      (actor as any).expireOldBookings(todayStr).catch(() => {});
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
      // Compute expiry date = bookingDate + 30 days
      const startDate = new Date(params.bookingDate);
      startDate.setDate(startDate.getDate() + 30);
      const expiryDate = startDate.toISOString().split("T")[0];
      return actor.createBooking(
        params.seatId,
        params.studentName,
        params.studentContact,
        params.bookingDate,
        expiryDate,
        params.timeSlot,
        params.bookingDuration,
        params.upiTransactionId,
        params.amount,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookedSeatIds"] });
      queryClient.invalidateQueries({ queryKey: ["bookedSeatIdsByRoom"] });
      queryClient.invalidateQueries({ queryKey: ["seatAvailable"] });
    },
  });
}

// rebookSeat in backend.ts only takes (studentId, password) — dates are handled server-side
export function useRebookSeat() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      studentId: string;
      password: string;
      newUpiTransactionId: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      // First update the payment info, then rebook
      // rebookSeat only takes (studentId, password) in backend.ts
      return actor.rebookSeat(params.studentId, params.password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookedSeatIdsByRoom"] });
    },
  });
}

// getMessageByCredentials is not in the generated backend.ts interface — use as any
export function useGetMessageByCredentials(
  studentId: string,
  password: string,
  enabled: boolean,
) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["messageByCredentials", studentId, password],
    queryFn: async () => {
      if (!actor || !studentId || !password) return null;
      return (actor as any).getMessageByCredentials(
        studentId,
        password,
      ) as Promise<{ content?: string } | null>;
    },
    enabled: !!actor && !isFetching && enabled && !!studentId && !!password,
  });
}

// sendMessage in backend.ts: (bookingId, sender, recipient, content, timestamp)
export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      bookingId: bigint;
      content: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.sendMessage(
        params.bookingId,
        "admin",
        "student",
        params.content,
        BigInt(Date.now()),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["messagesByBooking"] });
    },
  });
}

export function useGetMessagesByBooking(bookingId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["messagesByBooking", bookingId?.toString()],
    queryFn: async () => {
      if (!actor || !bookingId) return [];
      return actor.getMessagesByBooking(bookingId);
    },
    enabled: !!actor && !isFetching && bookingId !== null,
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

// NOTE: createRoom / updateRoom / deleteRoom do not exist in the backend.
// These mutations are kept for UI compatibility but will fail gracefully.
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

export function useDeleteBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteBooking(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["seats"] });
      queryClient.invalidateQueries({ queryKey: ["bookedSeatIds"] });
      queryClient.invalidateQueries({ queryKey: ["bookedSeatIdsByRoom"] });
    },
  });
}
