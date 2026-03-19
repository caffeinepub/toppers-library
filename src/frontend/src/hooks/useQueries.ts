import { BookingStatus } from "@/backend";
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

// Derive booked seat IDs from all bookings filtered by roomId
export function useBookedSeatIdsByRoom(roomId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["bookedSeatIdsByRoom", roomId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      const allBookings = await actor.getBookings();
      return allBookings
        .filter(
          (b) =>
            b.roomId === roomId &&
            (b.status === BookingStatus.pending ||
              b.status === BookingStatus.approved),
        )
        .map((b) => b.seatId);
    },
    enabled: !!actor && !isFetching,
  });
}

// Initialize on startup and check expired bookings per-booking
export function useInitialize() {
  const { actor, isFetching } = useActor();
  useEffect(() => {
    if (actor && !isFetching) {
      actor._initialize().catch(() => {});
      // Check each approved booking for expiry
      const todayStr = new Date().toISOString().split("T")[0];
      (async () => {
        try {
          const bookings = await actor.getBookings();
          const expired = bookings.filter(
            (b) =>
              b.status === BookingStatus.approved &&
              b.expiryDate !== "" &&
              b.expiryDate < todayStr,
          );
          for (const b of expired) {
            await actor
              .checkAndUpdateBookingExpired(b.id, todayStr)
              .catch(() => {});
          }
        } catch {
          // ignore
        }
      })();
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
      queryClient.invalidateQueries({ queryKey: ["seats"] });
    },
  });
}

export function useRebookSeat() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      studentId: string;
      password: string;
      newUpiTransactionId?: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.rebookSeat(params.studentId, params.password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookedSeatIdsByRoom"] });
    },
  });
}

// Get message for a student by looking up their booking's messages
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
      const booking = await actor.getBookingByCredentials(studentId, password);
      if (!booking) return null;
      const msgs = await actor.getMessagesByBooking(booking.id);
      if (msgs.length === 0) return null;
      return msgs[msgs.length - 1];
    },
    enabled: !!actor && !isFetching && enabled && !!studentId && !!password,
  });
}

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
      queryClient.invalidateQueries({ queryKey: ["seats"] });
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
