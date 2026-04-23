import type { UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";

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

export function getStoredUserId(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("auth:user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { id?: unknown };
    const id = typeof parsed?.id === "number" ? parsed.id : Number(parsed?.id);
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}

// =============================================================================
// Query keys (single source of truth)
// =============================================================================

export const queryKeys = {
  projects: {
    all: ["projects"] as const,
    listForUser: (userId: number) => ["projects", "listForUser", userId] as const,
    detail: (projectId: number) => ["projects", "detail", projectId] as const,
  },
  milestones: {
    detail: (milestoneId: number) =>
      ["milestones", "detail", milestoneId] as const,
  },
};

// =============================================================================
// Query + mutation option builders (UI consumes only these)
// =============================================================================

export const queryApi = {
  // -----------------------------
  // Queries
  // -----------------------------
  projects: {
    listForUser: (
      userId: number,
      cacheConfig?: CacheConfig,
    ): UseQueryOptions<APIResponse<ProjectReadWithMilestones[]>, Error> => ({
      queryKey: queryKeys.projects.listForUser(userId),
      queryFn: () => listProjectsForUser(userId),
      ...cache(cacheConfig),
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
      ): UseMutationOptions<APIResponse<ProjectRead>, Error, ProjectUpdate> => ({
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
  },
};

