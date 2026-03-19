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

export function useBookedSeatIdsByRoom(roomId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["bookedSeatIdsByRoom", roomId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getBookedSeatIdsByRoom(roomId);
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
      const today = new Date();
      const newBookingDate = today.toISOString().split("T")[0];
      const expiryDate = new Date(today);
      expiryDate.setDate(expiryDate.getDate() + 30);
      const newExpiryDate = expiryDate.toISOString().split("T")[0];
      return (actor as any).rebookSeat(
        params.studentId,
        params.password,
        newBookingDate,
        newExpiryDate,
        params.newUpiTransactionId,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookedSeatIdsByRoom"] });
    },
  });
}

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
      return (actor as any).getMessageByCredentials(studentId, password);
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
      return (actor as any).sendMessage(
        params.bookingId,
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
      return (actor as any).getMessagesByBooking(bookingId);
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
      return (actor as any).deleteBooking(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["seats"] });
      queryClient.invalidateQueries({ queryKey: ["bookedSeatIds"] });
      queryClient.invalidateQueries({ queryKey: ["bookedSeatIdsByRoom"] });
    },
  });
}
