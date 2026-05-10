import type {
  InfiniteData,
  UseInfiniteQueryOptions,
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";

// =============================================================================
// API layer imports (HTTP details live in src/lib/apis/**)
// =============================================================================

import type { APIResponse } from "@/lib/apis/apiResponse";

import type {
  ProjectCreate,
  ProjectRead,
  ProjectReadWithMilestones,
  ProjectUpdate,
} from "@/lib/apis/projects/schema";
import {
  createProject,
  deleteProject,
  getProjectWithMilestones,
  listProjectsForUser,
  updateProject,
} from "@/lib/apis/projects/projects";

import type {
  MilestoneCreate,
  MilestoneRead,
  MilestoneUpdate,
} from "@/lib/apis/milestones/schema";
import {
  createMilestone,
  deleteMilestone,
  updateMilestone,
} from "@/lib/apis/milestones/milestones";

import type { TaskCreate, TaskRead, TaskUpdate } from "@/lib/apis/tasks/schema";
import { createTask, deleteTask, updateTask } from "@/lib/apis/tasks/tasks";
import { createNote, updateNote, deleteNote, getNotes } from "@/lib/apis/notes/notes";
import type { NoteListResponse } from "@/lib/apis/notes/schema";
import type { NoteCreate, NoteRead, NoteUpdate } from "@/lib/apis/notes/schema";
import { createMeeting, deleteMeeting, listMeetingsByProject, updateMeeting } from "@/lib/apis/meetings/meetings";
import type { MeetingCreate, MeetingRead, MeetingUpdate } from "@/lib/apis/meetings/schema";
import { listActivityLogsByProjectId } from "@/lib/apis/activityLogs/activityLogs";
import type { ActivityLogRead } from "@/lib/apis/activityLogs/schema";
import { getDashboardSummary } from "@/lib/apis/dashboard/dashboard";
import type { DashboardSummary } from "@/lib/apis/dashboard/schema";
import { createFile, listFilesByProjectId, updateFile, deleteFile } from "@/lib/apis/files/files";
import type { FileCreate, FileRead, FileUpdate } from "@/lib/apis/files/schema";
import {
  listPaymentsByProjectId,
  listPaymentsReceived,
  listPaymentsSentRequested,
} from "@/lib/apis/payments/payments";
import type { PaymentRead } from "@/lib/apis/payments/schema";
import {
  getUnreadNotificationsCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationsRead,
} from "@/lib/apis/notifications/notifications";
import type {
  NotificationCountResponse,
  NotificationListResponse,
} from "@/lib/apis/notifications/schema";

// =============================================================================
// Cache config helpers (dynamic per-query overrides)
// =============================================================================

export type CacheConfig = {
  staleTime?: number;
  gcTime?: number;
};

const DEFAULT_CACHE: Required<CacheConfig> = {
  staleTime: 15 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
};

function cache(config?: CacheConfig): Required<CacheConfig> {
  return {
    staleTime: config?.staleTime ?? DEFAULT_CACHE.staleTime,
    gcTime: config?.gcTime ?? DEFAULT_CACHE.gcTime,
  };
}

// =============================================================================
// Small client helpers (non-API, non-UI)
// =============================================================================

/**
 * @deprecated User identity now comes from the SSR session via
 * `useSessionUser()` (see `@/lib/auth/user-context`). This helper used to
 * read `auth:user` from localStorage; it is preserved as a noop so older
 * call sites compile during the migration but always returns null and will
 * disable any cache key built on it. Migrate call sites to `useSessionUser`.
 */
export function getStoredUserId(): number | null {
  return null;
}

// =============================================================================
// Query keys (single source of truth)
// =============================================================================

export const queryKeys = {
  dashboard: {
    summary: ["dashboard", "summary"] as const,
  },
  projects: {
    all: ["projects"] as const,
    /**
     * Partition cache per signed-in user. API still resolves user from auth only —
     * `userId` is for React Query only.
     */
    listForUser: (userId: number) =>
      ["projects", "listForUser", userId] as const,
    detail: (projectId: number) => ["projects", "detail", projectId] as const,
  },
  milestones: {
    detail: (milestoneId: number) =>
      ["milestones", "detail", milestoneId] as const,
  },
  notes: {
    list: (projectId: number, meetingId?: number | null) =>
      ["notes", "list", projectId, meetingId ?? null] as const,
  },
  meetings: {
    listByProjectId: (projectId: number) =>
      ["meetings", "listByProjectId", projectId] as const,
  },
  activityLogs: {
    listByProjectId: (projectId: number, limit: number, offset: number) =>
      ["activityLogs", "listByProjectId", projectId, limit, offset] as const,
  },
  files: {
    listByProjectId: (projectId: number) =>
      ["files", "listByProjectId", projectId] as const,
  },
  payments: {
    listByProjectId: (projectId: number, forClient: boolean) =>
      ["payments", "listByProjectId", projectId, forClient] as const,
    received: (userId: number) => ["payments", "received", userId] as const,
    sentRequested: (userId: number) => ["payments", "sentRequested", userId] as const,
  },
  notifications: {
    /** `userId` partitions cache per account (API still resolves user from JWT). */
    list: (userId: number, offset: number, limit: number) =>
      ["notifications", "list", userId, offset, limit] as const,
    infiniteList: (userId: number, pageSize: number) =>
      ["notifications", "infinite", userId, pageSize] as const,
    unreadCount: (userId: number) =>
      ["notifications", "unreadCount", userId] as const,
  },
};

// =============================================================================
// Query + mutation option builders (UI consumes only these)
// =============================================================================

export const queryApi = {
  // -----------------------------
  // Queries
  // -----------------------------
  dashboard: {
    summary: (
      cacheConfig?: CacheConfig,
    ): UseQueryOptions<APIResponse<DashboardSummary>, Error> => ({
      queryKey: queryKeys.dashboard.summary,
      queryFn: () => getDashboardSummary(),
      ...cache(cacheConfig),
    }),
  },
  projects: {
    listForUser: (
      userId: number,
      cacheConfig?: CacheConfig,
    ): UseQueryOptions<APIResponse<ProjectReadWithMilestones[]>, Error> => ({
      queryKey: queryKeys.projects.listForUser(userId),
      queryFn: () => listProjectsForUser(),
      ...cache(cacheConfig),
      enabled: Number.isFinite(userId) && userId > 0,
    }),

    detailWithMilestones: (
      projectId: number,
      cacheConfig?: CacheConfig,
    ): UseQueryOptions<APIResponse<ProjectReadWithMilestones>, Error> => ({
      queryKey: queryKeys.projects.detail(projectId),
      queryFn: () => getProjectWithMilestones(projectId),
      ...cache(cacheConfig),
      enabled: Number.isFinite(projectId) && projectId > 0,
    }),
  },
  notes: {
    list: (
      projectId: number,
      meetingId?: number | null,
      cacheConfig?: CacheConfig,
    ): UseQueryOptions<APIResponse<NoteListResponse>, Error> => ({
      queryKey: queryKeys.notes.list(projectId, meetingId),
      queryFn: () => getNotes({ projectId, meetingId }),
      ...cache(cacheConfig),
      enabled: Number.isFinite(projectId) && projectId > 0,
    }),
  },

  meetings: {
    listByProjectId: (
      projectId: number,
      cacheConfig?: CacheConfig,
    ): UseQueryOptions<APIResponse<MeetingRead[]>, Error> => ({
      queryKey: queryKeys.meetings.listByProjectId(projectId),
      queryFn: () => listMeetingsByProject(projectId),
      ...cache(cacheConfig),
      enabled: Number.isFinite(projectId) && projectId > 0,
    }),
  },

  activityLogs: {
    listByProjectId: (
      projectId: number,
      params?: { limit?: number; offset?: number },
      cacheConfig?: CacheConfig,
    ): UseQueryOptions<APIResponse<ActivityLogRead[]>, Error> => ({
      queryKey: queryKeys.activityLogs.listByProjectId(
        projectId,
        params?.limit ?? 10,
        params?.offset ?? 0,
      ),
      queryFn: () =>
        listActivityLogsByProjectId(projectId, {
          limit: params?.limit ?? 10,
          offset: params?.offset ?? 0,
        }),
      ...cache(cacheConfig),
      enabled: Number.isFinite(projectId) && projectId > 0,
    }),
  },

  files: {
    listByProjectId: (
      projectId: number,
      cacheConfig?: CacheConfig,
    ): UseQueryOptions<APIResponse<FileRead[]>, Error> => ({
      queryKey: queryKeys.files.listByProjectId(projectId),
      queryFn: () => listFilesByProjectId(projectId),
      ...cache(cacheConfig),
      enabled: Number.isFinite(projectId) && projectId > 0,
    }),
  },

  payments: {
    listByProjectId: (
      projectId: number,
      opts?: { forClient?: boolean },
      cacheConfig?: CacheConfig,
    ): UseQueryOptions<APIResponse<PaymentRead[]>, Error> => ({
      queryKey: queryKeys.payments.listByProjectId(
        projectId,
        opts?.forClient === true,
      ),
      queryFn: () =>
        listPaymentsByProjectId(projectId, { forClient: opts?.forClient }),
      ...cache(cacheConfig),
      enabled: Number.isFinite(projectId) && projectId > 0,
    }),

    received: (
      userId: number,
      cacheConfig?: CacheConfig,
    ): UseQueryOptions<APIResponse<PaymentRead[]>, Error> => ({
      queryKey: queryKeys.payments.received(userId),
      queryFn: () => listPaymentsReceived(),
      ...cache(cacheConfig),
      enabled: Number.isFinite(userId) && userId > 0,
    }),

    sentRequested: (
      userId: number,
      cacheConfig?: CacheConfig,
    ): UseQueryOptions<APIResponse<PaymentRead[]>, Error> => ({
      queryKey: queryKeys.payments.sentRequested(userId),
      queryFn: () => listPaymentsSentRequested(),
      ...cache(cacheConfig),
      enabled: Number.isFinite(userId) && userId > 0,
    }),
  },

  notifications: {
    list: (
      userId: number,
      opts?: { offset?: number; limit?: number },
      cacheConfig?: CacheConfig,
    ): UseQueryOptions<APIResponse<NotificationListResponse>, Error> => {
      const offset = opts?.offset ?? 0;
      const limit = opts?.limit ?? 50;
      return {
        queryKey: queryKeys.notifications.list(userId, offset, limit),
        queryFn: () => listNotifications({ offset, limit }),
        ...cache(cacheConfig),
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
        enabled: Number.isFinite(userId) && userId > 0,
      };
    },

    unreadCount: (
      userId: number,
      cacheConfig?: CacheConfig,
    ): UseQueryOptions<APIResponse<NotificationCountResponse>, Error> => ({
      queryKey: queryKeys.notifications.unreadCount(userId),
      queryFn: () => getUnreadNotificationsCount(),
      ...cache(cacheConfig),
      staleTime: 15 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchInterval: 15 * 1000,
      refetchIntervalInBackground: true,
      enabled: Number.isFinite(userId) && userId > 0,
    }),

    infiniteList: (
      userId: number,
      pageSize: number,
      cacheConfig?: CacheConfig,
    ): UseInfiniteQueryOptions<
      APIResponse<NotificationListResponse>,
      Error,
      InfiniteData<APIResponse<NotificationListResponse>>,
      readonly (string | number)[],
      number
    > => ({
      queryKey: queryKeys.notifications.infiniteList(userId, pageSize),
      queryFn: ({ pageParam }) =>
        listNotifications({ offset: pageParam, limit: pageSize }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        if (!lastPage.success || !lastPage.data) return undefined;
        const { results, total, offset } = lastPage.data;
        if (results.length === 0) return undefined;
        const nextOffset = offset + results.length;
        if (nextOffset >= total) return undefined;
        return nextOffset;
      },
      ...cache(cacheConfig),
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      enabled: Number.isFinite(userId) && userId > 0,
    }),
  },

  // -----------------------------
  // Mutations
  // -----------------------------
  mutations: {
    projects: {
      create: (): UseMutationOptions<
        APIResponse<ProjectRead>,
        Error,
        ProjectCreate
      > => ({
        mutationFn: (data) => createProject(data),
      }),
      update: (
        projectId: number,
      ): UseMutationOptions<
        APIResponse<ProjectRead>,
        Error,
        ProjectUpdate
      > => ({
        mutationFn: (data) => updateProject(projectId, data),
      }),
      delete: (): UseMutationOptions<
        APIResponse<boolean>,
        Error,
        { projectId: number }
      > => ({
        mutationFn: ({ projectId }) => deleteProject(projectId),
      }),
    },
    milestones: {
      create: (): UseMutationOptions<
        APIResponse<MilestoneRead>,
        Error,
        MilestoneCreate
      > => ({
        mutationFn: (data) => createMilestone(data),
      }),
      update: (
        milestoneId: number,
      ): UseMutationOptions<
        APIResponse<MilestoneRead>,
        Error,
        MilestoneUpdate
      > => ({
        mutationFn: (data) => updateMilestone(milestoneId, data),
      }),
      delete: (): UseMutationOptions<
        APIResponse<boolean>,
        Error,
        { milestoneId: number }
      > => ({
        mutationFn: ({ milestoneId }) => deleteMilestone(milestoneId),
      }),
    },
    tasks: {
      create: (): UseMutationOptions<
        APIResponse<TaskRead>,
        Error,
        TaskCreate
      > => ({
        mutationFn: (data) => createTask(data),
      }),
      update: (
        taskId: number,
      ): UseMutationOptions<APIResponse<TaskRead>, Error, TaskUpdate> => ({
        mutationFn: (data) => updateTask(taskId, data),
      }),
      delete: (): UseMutationOptions<
        APIResponse<boolean>,
        Error,
        { taskId: number }
      > => ({
        mutationFn: ({ taskId }) => deleteTask(taskId),
      }),
    },
    notes: {
      create: (): UseMutationOptions<
        APIResponse<NoteRead>,
        Error,
        NoteCreate
      > => ({
        mutationFn: (data) => createNote(data),
      }),
      update: (
        noteId: number,
      ): UseMutationOptions<APIResponse<NoteRead>, Error, NoteUpdate> => ({
        mutationFn: (data) => updateNote(noteId, data),
      }),
      delete: (): UseMutationOptions<APIResponse<boolean>, Error, { noteId: number }> => ({
        mutationFn: ({ noteId }) => deleteNote(noteId),
      }),
    },
    meetings: {
      create: (): UseMutationOptions<
        APIResponse<MeetingRead>,
        Error,
        MeetingCreate
      > => ({
        mutationFn: (data) => createMeeting(data),
      }),
      update: (
        meetingId: number,
      ): UseMutationOptions<APIResponse<MeetingRead>, Error, MeetingUpdate> => ({
        mutationFn: (data) => updateMeeting(meetingId, data),
      }),
      delete: (): UseMutationOptions<
        APIResponse<boolean>,
        Error,
        { meetingId: number }
      > => ({
        mutationFn: ({ meetingId }) => deleteMeeting(meetingId),
      }),
    },

    files: {
      create: (): UseMutationOptions<
        APIResponse<FileRead>,
        Error,
        FileCreate
      > => ({
        mutationFn: (data) => createFile(data),
      }),
      update: (
        fileId: number,
      ): UseMutationOptions<APIResponse<FileRead>, Error, FileUpdate> => ({
        mutationFn: (data) => updateFile(fileId, data),
      }),
      delete: (): UseMutationOptions<
        APIResponse<boolean>,
        Error,
        { fileId: number }
      > => ({
        mutationFn: ({ fileId }) => deleteFile(fileId),
      }),
    },

    notifications: {
      markRead: (): UseMutationOptions<
        APIResponse<NotificationCountResponse>,
        Error,
        number[]
      > => ({
        mutationFn: (notification_ids) => markNotificationsRead(notification_ids),
      }),
      markAllRead: (): UseMutationOptions<
        APIResponse<NotificationCountResponse>,
        Error,
        void
      > => ({
        mutationFn: () => markAllNotificationsRead(),
      }),
    },
  },
};
