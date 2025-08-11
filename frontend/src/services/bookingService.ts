import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, handleApiError, ApiResponse, PaginatedResponse } from "@/lib/api";
import {
  Booking,
  CreateBookingRequest,
  BookingSearchParams,
} from "@/lib/types";

// API calls
const bookingApi = {
  getBookings: async (
    params: BookingSearchParams = {}
  ): Promise<PaginatedResponse<Booking>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Booking>>>(
      "/bookings",
      { params }
    );
    return response.data.data!;
  },

  getBookingById: async (bookingId: number): Promise<Booking> => {
    const response = await api.get<ApiResponse<Booking>>(
      `/bookings/${bookingId}`
    );
    return response.data.data!;
  },

  createBooking: async (
    bookingData: CreateBookingRequest
  ): Promise<Booking> => {
    const response = await api.post<ApiResponse<Booking>>(
      "/bookings",
      bookingData
    );
    return response.data.data!;
  },

  cancelBooking: async (
    bookingId: number,
    reason?: string
  ): Promise<Booking> => {
    const response = await api.patch<ApiResponse<Booking>>(
      `/bookings/${bookingId}/cancel`,
      { reason }
    );
    return response.data.data!;
  },

  rescheduleBooking: async (
    bookingId: number,
    data: {
      newDate: string;
      newStartTime: string;
      newEndTime: string;
    }
  ): Promise<Booking> => {
    const response = await api.patch<ApiResponse<Booking>>(
      `/bookings/${bookingId}/reschedule`,
      data
    );
    return response.data.data!;
  },

  getUpcomingBookings: async (): Promise<Booking[]> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Booking>>>(
      "/bookings",
      {
        params: { upcoming: true, status: "confirmed" },
      }
    );
    return response.data.data?.items || [];
  },

  getBookingHistory: async (limit: number = 20): Promise<Booking[]> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Booking>>>(
      "/bookings",
      {
        params: { status: "completed", limit },
      }
    );
    return response.data.data?.items || [];
  },
};

// React Query hooks
export const useBookings = (params: BookingSearchParams = {}) => {
  return useQuery({
    queryKey: ["bookings", "list", params],
    queryFn: () => bookingApi.getBookings(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useBookingDetails = (bookingId: number) => {
  return useQuery({
    queryKey: ["bookings", "details", bookingId],
    queryFn: () => bookingApi.getBookingById(bookingId),
    enabled: !!bookingId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpcomingBookings = () => {
  return useQuery({
    queryKey: ["bookings", "upcoming"],
    queryFn: bookingApi.getUpcomingBookings,
    staleTime: 2 * 60 * 1000,
  });
};

export const useBookingHistory = (limit: number = 20) => {
  return useQuery({
    queryKey: ["bookings", "history", limit],
    queryFn: () => bookingApi.getBookingHistory(limit),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingApi.createBooking,
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["venues", "details"] }); // For availability updates
      queryClient.invalidateQueries({
        queryKey: ["venueManagement", "timeSlots"],
      });
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      throw apiError;
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      reason,
    }: {
      bookingId: number;
      reason?: string;
    }) => bookingApi.cancelBooking(bookingId, reason),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({
        queryKey: ["bookings", "details", variables.bookingId],
      });
      queryClient.invalidateQueries({ queryKey: ["venues", "details"] }); // For availability updates
      queryClient.invalidateQueries({
        queryKey: ["venueManagement", "timeSlots"],
      });
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      throw apiError;
    },
  });
};

export const useRescheduleBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      data,
    }: {
      bookingId: number;
      data: { newDate: string; newStartTime: string; newEndTime: string };
    }) => bookingApi.rescheduleBooking(bookingId, data),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({
        queryKey: ["bookings", "details", variables.bookingId],
      });
      queryClient.invalidateQueries({ queryKey: ["venues", "details"] }); // For availability updates
      queryClient.invalidateQueries({
        queryKey: ["venueManagement", "timeSlots"],
      });
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      throw apiError;
    },
  });
};
