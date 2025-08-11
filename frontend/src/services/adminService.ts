import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, handleApiError, ApiResponse, PaginatedResponse } from "@/lib/api";
import {
  AdminDashboardStats,
  BackendDashboardResponse,
  User,
  Venue,
  UserManagementParams,
  UserStatusUpdate,
  VenueReviewAction,
  SystemReport,
  RecentActivity,
} from "@/lib/types";

// API calls
const adminApi = {
  getDashboard: async (): Promise<AdminDashboardStats> => {
    const response = await api.get<ApiResponse<BackendDashboardResponse>>(
      "/admin/dashboard"
    );

    // Map backend response to frontend types
    const data = response.data.data!;
    return {
      totalUsers: data.stats.total_customers + data.stats.total_owners,
      totalVenues: data.stats.total_venues,
      totalBookings: data.stats.total_bookings,
      totalRevenue: data.stats.total_revenue,
      pendingVenues: data.stats.pending_venues,
      activeUsers: data.stats.total_customers + data.stats.total_owners, // Adjust based on actual active users logic
      recentBookings: [], // Would need separate endpoint for actual recent bookings
      topVenues: [], // Would need additional endpoint for top venues
      trends: data.trends || [],
      recentActivities: data.recentActivities || [],
    };
  },

  getUsers: async (
    params: UserManagementParams = {}
  ): Promise<PaginatedResponse<User>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<User>>>(
      "/admin/users",
      { params }
    );
    return response.data.data!;
  },

  getUserById: async (userId: number): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(`/admin/users/${userId}`);
    return response.data.data!;
  },

  updateUserStatus: async (
    userId: number,
    data: UserStatusUpdate
  ): Promise<User> => {
    const response = await api.patch<ApiResponse<User>>(
      `/admin/users/${userId}/status`,
      data
    );
    return response.data.data!;
  },

  deleteUser: async (userId: number): Promise<void> => {
    await api.delete(`/admin/users/${userId}`);
  },

  getVenuesForReview: async (
    params: {
      status?: "pending" | "approved" | "all";
      search?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<PaginatedResponse<Venue>> => {
    const response = await api.get<
      ApiResponse<{
        venues: Venue[];
        pagination: {
          total: number;
          limit: number;
          offset: number;
          hasNext: boolean;
        };
      }>
    >("/admin/venues", { params });

    // Transform backend response to match frontend expected structure
    const backendData = response.data.data!;
    return {
      items: backendData.venues,
      pagination: backendData.pagination,
    };
  },

  reviewVenue: async (
    venueId: number,
    data: VenueReviewAction
  ): Promise<Venue> => {
    const response = await api.patch<ApiResponse<Venue>>(
      `/admin/venues/${venueId}/review`,
      data
    );
    return response.data.data!;
  },

  getSystemReports: async (
    reportType: "bookings" | "revenue" | "users" | "venues",
    startDate: string,
    endDate: string
  ): Promise<SystemReport> => {
    const response = await api.get<ApiResponse<SystemReport>>(
      "/admin/reports",
      {
        params: { reportType, startDate, endDate },
      }
    );
    return response.data.data!;
  },

  getVenueDetails: async (venueId: number): Promise<Venue> => {
    const response = await api.get<ApiResponse<Venue>>(
      `/admin/venues/${venueId}`
    );
    return response.data.data!;
  },

  suspendVenue: async (venueId: number, reason: string): Promise<Venue> => {
    const response = await api.patch<ApiResponse<Venue>>(
      `/admin/venues/${venueId}/suspend`,
      { reason }
    );
    return response.data.data!;
  },

  activateVenue: async (venueId: number): Promise<Venue> => {
    const response = await api.patch<ApiResponse<Venue>>(
      `/admin/venues/${venueId}/activate`
    );
    return response.data.data!;
  },

  getReportsData: async (
    type: "overview" | "bookings" | "revenue" | "users"
  ): Promise<Record<string, unknown>> => {
    const response = await api.get<ApiResponse<Record<string, unknown>>>(
      `/admin/reports/${type}`
    );
    return response.data.data!;
  },
};

// React Query hooks
export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: adminApi.getDashboard,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAdminUsers = (params: UserManagementParams = {}) => {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => adminApi.getUsers(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useAdminUserDetails = (userId: number) => {
  return useQuery({
    queryKey: ["admin", "users", "details", userId],
    queryFn: () => adminApi.getUserById(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAdminVenues = (
  params: {
    status?: "pending" | "approved" | "all";
    search?: string;
    limit?: number;
    offset?: number;
  } = {}
) => {
  return useQuery({
    queryKey: ["admin", "venues", params],
    queryFn: () => adminApi.getVenuesForReview(params),
    staleTime: 2 * 60 * 1000,
  });
};

export const useAdminVenueDetails = (venueId: number) => {
  return useQuery({
    queryKey: ["admin", "venues", "details", venueId],
    queryFn: () => adminApi.getVenueDetails(venueId),
    enabled: !!venueId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSystemReports = (
  reportType: "bookings" | "revenue" | "users" | "venues",
  startDate: string,
  endDate: string
) => {
  return useQuery({
    queryKey: ["admin", "reports", reportType, startDate, endDate],
    queryFn: () => adminApi.getSystemReports(reportType, startDate, endDate),
    enabled: !!reportType && !!startDate && !!endDate,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useReportsData = (
  type: "overview" | "bookings" | "revenue" | "users"
) => {
  return useQuery({
    queryKey: ["admin", "reportsData", type],
    queryFn: () => adminApi.getReportsData(type),
    enabled: !!type,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: number;
      data: UserStatusUpdate;
    }) => adminApi.updateUserStatus(userId, data),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "users", "details", variables.userId],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      throw apiError;
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      throw apiError;
    },
  });
};

export const useReviewVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      venueId,
      data,
    }: {
      venueId: number;
      data: VenueReviewAction;
    }) => adminApi.reviewVenue(venueId, data),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["admin", "venues"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "venues", "details", variables.venueId],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["venues"] }); // Public venue queries
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      throw apiError;
    },
  });
};

export const useSuspendVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ venueId, reason }: { venueId: number; reason: string }) =>
      adminApi.suspendVenue(venueId, reason),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["admin", "venues"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "venues", "details", variables.venueId],
      });
      queryClient.invalidateQueries({ queryKey: ["venues"] }); // Public venue queries
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      throw apiError;
    },
  });
};

export const useActivateVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminApi.activateVenue,
    onSuccess: (_, venueId) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["admin", "venues"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "venues", "details", venueId],
      });
      queryClient.invalidateQueries({ queryKey: ["venues"] }); // Public venue queries
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      throw apiError;
    },
  });
};
