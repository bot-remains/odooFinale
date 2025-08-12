import { api, ApiResponse, handleApiError } from "../lib/api";

export interface TimeSlot {
  id: number;
  venueId: number;
  courtId: number;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  isAvailable: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTimeSlotRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable?: boolean;
}

export interface CreateTimeSlotsRequest {
  timeSlots: CreateTimeSlotRequest[];
}

export interface GenerateDefaultSlotsRequest {
  operatingHours?: {
    start: string;
    end: string;
  };
  slotDuration?: number; // in minutes, default 60
  daysOfWeek?: number[]; // days to generate for, default all days
}

export interface BlockedSlot {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  reason?: string;
  createdAt: string;
}

export interface BlockTimeSlotsRequest {
  dayOfWeek: number;
  timeSlots: {
    startTime: string;
    endTime: string;
  }[];
}

class TimeSlotService {
  // Get time slots for a specific court
  async getTimeSlots(
    venueId: number,
    courtId: number,
    dayOfWeek?: number
  ): Promise<TimeSlot[]> {
    try {
      const params = dayOfWeek !== undefined ? { dayOfWeek } : {};
      const response = await api.get<ApiResponse<TimeSlot[]>>(
        `/venue-management/venues/${venueId}/courts/${courtId}/time-slots`,
        { params }
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || "Failed to fetch time slots");
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Create multiple time slots
  async createTimeSlots(
    venueId: number,
    courtId: number,
    request: CreateTimeSlotsRequest
  ): Promise<TimeSlot[]> {
    try {
      const response = await api.post<ApiResponse<TimeSlot[]>>(
        `/venue-management/venues/${venueId}/courts/${courtId}/time-slots`,
        request
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || "Failed to create time slots");
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Update a specific time slot
  async updateTimeSlot(
    venueId: number,
    courtId: number,
    slotId: number,
    updates: Partial<CreateTimeSlotRequest>
  ): Promise<TimeSlot> {
    try {
      const response = await api.put<ApiResponse<TimeSlot>>(
        `/venue-management/venues/${venueId}/courts/${courtId}/time-slots/${slotId}`,
        updates
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || "Failed to update time slot");
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Delete a time slot
  async deleteTimeSlot(
    venueId: number,
    courtId: number,
    slotId: number
  ): Promise<void> {
    try {
      const response = await api.delete<ApiResponse<void>>(
        `/venue-management/venues/${venueId}/courts/${courtId}/time-slots/${slotId}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete time slot");
      }
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Generate default time slots
  async generateDefaultTimeSlots(
    venueId: number,
    courtId: number,
    config: GenerateDefaultSlotsRequest
  ): Promise<TimeSlot[]> {
    try {
      const response = await api.post<ApiResponse<TimeSlot[]>>(
        `/venue-management/venues/${venueId}/courts/${courtId}/time-slots/generate-default`,
        config
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || "Failed to generate time slots");
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Get blocked time slots
  async getBlockedSlots(
    venueId: number,
    courtId: number,
    dayOfWeek: number
  ): Promise<BlockedSlot[]> {
    try {
      const response = await api.get<ApiResponse<BlockedSlot[]>>(
        `/venue-management/venues/${venueId}/courts/${courtId}/blocked-slots`,
        { params: { dayOfWeek } }
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || "Failed to fetch blocked slots");
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Block time slots
  async blockTimeSlots(
    venueId: number,
    courtId: number,
    request: BlockTimeSlotsRequest
  ): Promise<void> {
    try {
      const response = await api.post<ApiResponse<void>>(
        `/venue-management/venues/${venueId}/courts/${courtId}/blocked-slots`,
        request
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to block time slots");
      }
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Unblock time slots
  async unblockTimeSlots(
    venueId: number,
    courtId: number,
    request: BlockTimeSlotsRequest
  ): Promise<void> {
    try {
      const response = await api.delete<ApiResponse<void>>(
        `/venue-management/venues/${venueId}/courts/${courtId}/blocked-slots`,
        { data: request }
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to unblock time slots"
        );
      }
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Helper function to get all time slots for a court grouped by day
  async getWeeklySchedule(
    venueId: number,
    courtId: number
  ): Promise<{ [dayOfWeek: number]: TimeSlot[] }> {
    try {
      const allSlots = await this.getTimeSlots(venueId, courtId);
      const weeklySchedule: { [dayOfWeek: number]: TimeSlot[] } = {};

      // Initialize all days
      for (let day = 0; day < 7; day++) {
        weeklySchedule[day] = [];
      }

      // Group slots by day
      allSlots.forEach((slot) => {
        weeklySchedule[slot.dayOfWeek].push(slot);
      });

      // Sort slots by start time for each day
      Object.keys(weeklySchedule).forEach((day) => {
        weeklySchedule[parseInt(day)].sort((a, b) =>
          a.startTime.localeCompare(b.startTime)
        );
      });

      return weeklySchedule;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const timeSlotService = new TimeSlotService();
export default timeSlotService;
