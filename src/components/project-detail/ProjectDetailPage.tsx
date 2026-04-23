"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  activityLogs,
  initialComments,
  initialMeetings,
  projectFiles,
  type CommentMessage,
  type Meeting,
  type Milestone,
  type MilestoneStatus,
  type ProjectFile,
  type TaskItem,
} from "@/constants/project-detail";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ProjectSummary, ProjectStatus } from "@/constants/project-detail";
import { queryApi, queryKeys } from "@/lib/queryApi";
import type { MilestoneRead } from "@/lib/apis/milestones/schema";
import type { ProjectReadWithMilestones } from "@/lib/apis/projects/schema";
import type { ProjectUpdate } from "@/lib/apis/projects/schema";
import { Modal } from "@/components/project-detail/components/Modal";
import { Field, inputCls, selectCls } from "@/components/project-detail/components/Field";
import { Button } from "@/components/ui/button";
import { Calendar, Pencil } from "lucide-react";
import { toLocalDateTime } from "@/lib/utils";
import type { APIResponse } from "@/lib/apis/apiResponse";
import type { TaskRead } from "@/lib/apis/tasks/schema";
import { updateMilestone } from "@/lib/apis/milestones/milestones";
import { updateTask } from "@/lib/apis/tasks/tasks";
import { updateProject } from "@/lib/apis/projects/projects";

import { MilestoneStepTracker } from "@/components/project-detail/components/MilestoneStepTracker";
import { OverviewPanel } from "@/components/project-detail/components/OverviewPanel";
import { MilestonesPanel } from "@/components/project-detail/components/MilestonesPanel";
import { FilesPanel } from "@/components/project-detail/components/FilesPanel";
import { CommentsPanel } from "@/components/project-detail/components/CommentsPanel";
import { MeetingsPanel } from "@/components/project-detail/components/MeetingsPanel";
import { NotesPanel } from "@/components/project-detail/components/NotesPanel";
import { PaymentsPanel } from "@/components/project-detail/components/PaymentsPanel";
import { ActivityPanel } from "@/components/project-detail/components/ActivityPanel";

function toUiProjectStatus(status?: string): ProjectStatus {
  const s = (status ?? "pending").toLowerCase();
  if (s === "in_progress") return "in-progress";
  if (s === "completed") return "completed";
  return "pending";
}

function toUiMilestoneStatus(status?: string | null): MilestoneStatus {
  const s = (status ?? "pending").toLowerCase();
  if (s === "in_progress") return "in-progress";
  if (s === "completed") return "completed";
  return "pending";
}

function formatMoney(amount?: number) {
  const value = typeof amount === "number" ? amount : 0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `$${value}`;
  }
}

function formatLongDate(dateStr?: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function toLocalDate(isoLike: string): string {
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  return `${yyyy}-${mm}-${dd}`;
}

function toUiMilestone(ms: MilestoneRead): Milestone {
  return {
    id: String(ms.id),
    title: ms.title,
    description: ms.description,
    dueDate: formatLongDate(ms.due_date),
    dueDateIso: ms.due_date,
    amount: formatMoney(ms.price),
    status: toUiMilestoneStatus(ms.status),
    tasks: (ms.tasks ?? []).map((t) => ({
      id: String(t.id),
      title: t.title,
      description: t.description,
    })),
  };
}

function toUiTask(task: TaskRead): TaskItem {
  return {
    id: String(task.id),
    title: task.title,
    description: task.description,
  };
}

function toUiProjectSummary(p: ProjectReadWithMilestones): ProjectSummary {
  return {
    id: String(p.id),
    title: p.title,
    status: toUiProjectStatus(p.status),
    description: p.description,
    startDate: formatLongDate(p.start_date),
    endDate: formatLongDate(p.end_date),
    paidAmount: formatMoney(p.amount_paid),
    totalAmount: formatMoney(p.total_amount),
  };
}

// ─── Tab list ────────────────────────────────────────────────────────────────

const tabs = [
  "Overview",
  "Milestones",
  "Files",
  "Comments",
  "Meetings",
  "Notes",
  "Payments",
  "Activity",
] as const;

type Tab = (typeof tabs)[number];

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProjectDetailPage({ projectId }: { projectId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const initializedProjectRef = useRef<number | null>(null);

  // ── Tab state
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  const numericProjectId = Number(projectId);
  const {
    data: projectRes,
    isLoading: isProjectLoading,
    error: projectError,
  } = useQuery(queryApi.projects.detailWithMilestones(numericProjectId));

  const projectDetail = projectRes?.data ?? null;

  const projectDetailQueryKey = queryKeys.projects.detail(numericProjectId);

  function setProjectDetailCache(
    updater: (
      prev: APIResponse<ProjectReadWithMilestones> | undefined,
    ) => APIResponse<ProjectReadWithMilestones> | undefined,
  ) {
    queryClient.setQueryData(projectDetailQueryKey, updater);
  }

  function patchMilestoneInCache(ms: MilestoneRead) {
    setProjectDetailCache((prev) => {
      if (!prev?.data) return prev;
      const list = prev.data.milestones ?? [];
      const next = list.some((m) => m.id === ms.id)
        ? list.map((m) => (m.id === ms.id ? ms : m))
        : [...list, ms];
      return { ...prev, data: { ...prev.data, milestones: next } };
    });
  }

  function removeMilestoneFromCache(milestoneId: number) {
    setProjectDetailCache((prev) => {
      if (!prev?.data) return prev;
      const list = prev.data.milestones ?? [];
      return {
        ...prev,
        data: { ...prev.data, milestones: list.filter((m) => m.id !== milestoneId) },
      };
    });
  }

  function patchTaskInCache(milestoneId: number, task: TaskRead) {
    setProjectDetailCache((prev) => {
      if (!prev?.data) return prev;
      const milestones = prev.data.milestones ?? [];
      const nextMilestones = milestones.map((ms) => {
        if (ms.id !== milestoneId) return ms;
        const tasks = ms.tasks ?? [];
        const nextTasks = tasks.some((t) => t.id === task.id)
          ? tasks.map((t) => (t.id === task.id ? task : t))
          : [...tasks, task];
        return { ...ms, tasks: nextTasks };
      });
      return { ...prev, data: { ...prev.data, milestones: nextMilestones } };
    });
  }

  function removeTaskFromCache(milestoneId: number, taskId: number) {
    setProjectDetailCache((prev) => {
      if (!prev?.data) return prev;
      const milestones = prev.data.milestones ?? [];
      const nextMilestones = milestones.map((ms) => {
        if (ms.id !== milestoneId) return ms;
        return { ...ms, tasks: (ms.tasks ?? []).filter((t) => t.id !== taskId) };
      });
      return { ...prev, data: { ...prev.data, milestones: nextMilestones } };
    });
  }

  const createMilestoneMutation = useMutation(queryApi.mutations.milestones.create());
  const updateMilestoneMutation = useMutation({
    mutationFn: async (vars: { milestoneId: number; data: unknown }) => {
      return updateMilestone(vars.milestoneId, vars.data as never);
    },
  });
  const deleteMilestoneMutation = useMutation(queryApi.mutations.milestones.delete());

  const createTaskMutation = useMutation(queryApi.mutations.tasks.create());
  const updateTaskMutation = useMutation({
    mutationFn: async (vars: { taskId: number; data: unknown }) => {
      return updateTask(vars.taskId, vars.data as never);
    },
  });
  const deleteTaskMutation = useMutation(queryApi.mutations.tasks.delete());

  const updateProjectMutation = useMutation({
    mutationFn: async (vars: { projectId: number; data: unknown }) => {
      return updateProject(vars.projectId, vars.data as never);
    },
  });
  const deleteProjectMutation = useMutation(queryApi.mutations.projects.delete());

  const [projectSummary, setProjectSummary] = useState<ProjectSummary>(() => ({
    id: projectId,
    title: "Loading…",
    status: "pending",
    description: "",
    startDate: "—",
    endDate: "—",
    paidAmount: "$0",
    totalAmount: "$0",
  }));

  // ── Project modal (edit / delete)
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [pTitle, setPTitle] = useState("");
  const [pDescription, setPDescription] = useState("");
  const [pStatus, setPStatus] = useState<ProjectStatus>("pending");
  const [pTotalAmount, setPTotalAmount] = useState("");
  const [pAmountPaid, setPAmountPaid] = useState("");
  const [pStartDate, setPStartDate] = useState("");
  const [pEndDate, setPEndDate] = useState("");
  const startDateInputRef = useRef<HTMLInputElement | null>(null);
  const endDateInputRef = useRef<HTMLInputElement | null>(null);

  // ── Milestone state (populated from API)
  const [milestoneState, setMilestoneState] = useState<Milestone[]>([]);
  const [milestoneSort, setMilestoneSort] = useState<"dueDate" | "order">(
    "dueDate",
  );
  const [expandedMilestones, setExpandedMilestones] = useState<
    Record<string, boolean>
  >({});

  // Milestone modal (create / edit)
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [milestoneModalMode, setMilestoneModalMode] = useState<
    "create" | "edit"
  >("create");
  const [milestoneModalEditingId, setMilestoneModalEditingId] = useState<
    string | null
  >(null);
  const [msTitle, setMsTitle] = useState("");
  const [msDescription, setMsDescription] = useState("");
  const [msDueDate, setMsDueDate] = useState("");
  const [msAmount, setMsAmount] = useState("");
  const [msStatus, setMsStatus] = useState<MilestoneStatus>("pending");

  // ── Task modal (create / edit)
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState<"create" | "edit">("create");
  const [taskModalMilestoneId, setTaskModalMilestoneId] = useState<string | null>(
    null,
  );
  const [taskModalEditingId, setTaskModalEditingId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState("New task");
  const [taskDescription, setTaskDescription] = useState("");

  // Milestone inline status dropdown
  const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(
    null,
  );

  // ── Comments
  const [comments, setComments] = useState<CommentMessage[]>(initialComments);
  const [commentDraft, setCommentDraft] = useState("");

  // ── Meetings
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [meetingFormOpen, setMeetingFormOpen] = useState(false);
  const [meetingFormMode, setMeetingFormMode] = useState<"create" | "edit">(
    "create",
  );
  const [meetingFormEditingId, setMeetingFormEditingId] = useState<
    string | null
  >(null);
  const [mtTitle, setMtTitle] = useState("");
  const [mtLink, setMtLink] = useState("");
  const [mtDateTime, setMtDateTime] = useState("");
  const [mtDescription, setMtDescription] = useState("");

  // Meeting notes sub-view
  const [meetingNotesId, setMeetingNotesId] = useState<string | null>(null);

  // ── Notes tab
  const [privateNotes, setPrivateNotes] = useState(
    "Internal project notes...",
  );
  const [sharedNotes, setSharedNotes] = useState(
    "Notes visible to both freelancer and client.",
  );

  // ── Payments
  const [paymentActions, setPaymentActions] = useState<
    Record<string, "pay" | "invoice">
  >({});

  // ── Files
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>(() =>
    projectFiles.map((f) => ({ ...f })),
  );

  useEffect(() => {
    if (!projectDetail) return;
    setProjectSummary(toUiProjectSummary(projectDetail));

    // Merge into existing state to preserve stable ordering + open tab
    setMilestoneState((prev) => {
      const incoming = (projectDetail.milestones ?? []).map(toUiMilestone);
      if (prev.length === 0) return incoming;

      const byId = new Map(incoming.map((m) => [m.id, m]));
      const merged = prev
        .map((m) => byId.get(m.id) ?? m)
        .filter((m) => byId.has(m.id) || prev.some((p) => p.id === m.id));
      const prevIds = new Set(prev.map((m) => m.id));
      const appended = incoming.filter((m) => !prevIds.has(m.id));
      return [...merged, ...appended];
    });

    // Only reset UI state when switching to a different project id
    if (initializedProjectRef.current !== projectDetail.id) {
      initializedProjectRef.current = projectDetail.id;
      setExpandedMilestones({});
      setOpenStatusDropdown(null);
      setActiveTab("Overview");
    }
  }, [projectDetail]);

  // ── Derived
  const sortedMilestones = useMemo(() => {
    const list = [...milestoneState];
    if (milestoneSort === "order") {
      return list.sort((a, b) => Number(a.id) - Number(b.id));
    }
    return list.sort((a, b) => {
      const aT = new Date(a.dueDateIso).getTime();
      const bT = new Date(b.dueDateIso).getTime();
      if (Number.isNaN(aT) && Number.isNaN(bT)) return 0;
      if (Number.isNaN(aT)) return 1;
      if (Number.isNaN(bT)) return -1;
      return aT - bT;
    });
  }, [milestoneState, milestoneSort]);

  const completedMilestones = useMemo(
    () => sortedMilestones.filter((m) => m.status === "completed"),
    [sortedMilestones],
  );

  const nextMilestone =
    sortedMilestones.find((m) => m.status !== "completed") ??
    sortedMilestones[0] ??
    {
      id: "0",
      title: "No milestones yet",
      description: "",
      dueDate: "—",
      dueDateIso: "",
      amount: "$0",
      status: "pending" as const,
      tasks: [],
    };

  // ─────────────────────────────────────── Handlers ──

  const handleSendComment = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!commentDraft.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: `c-${prev.length + 1}`,
        role: "freelancer",
        message: commentDraft.trim(),
        timestamp: "Now",
      },
    ]);
    setCommentDraft("");
  };

  const openMeetingForm = (mode: "create" | "edit", meeting?: Meeting) => {
    setMeetingFormMode(mode);
    setMeetingFormEditingId(meeting?.id ?? null);
    setMtTitle(meeting?.title ?? "");
    setMtLink(meeting?.link ?? "");
    setMtDateTime(meeting?.dateTime ?? "");
    setMtDescription(meeting?.description ?? "");
    setMeetingFormOpen(true);
  };

  const handleMeetingSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!mtTitle || !mtLink || !mtDateTime) return;
    if (meetingFormMode === "edit" && meetingFormEditingId) {
      setMeetings((prev) =>
        prev.map((m) =>
          m.id === meetingFormEditingId
            ? {
                ...m,
                title: mtTitle,
                link: mtLink,
                dateTime: mtDateTime,
                description: mtDescription || "No description.",
              }
            : m,
        ),
      );
    } else {
      setMeetings((prev) => [
        {
          id: `m-${prev.length + 1}`,
          title: mtTitle,
          link: mtLink,
          dateTime: mtDateTime,
          description: mtDescription || "No description.",
          privateNotes: "",
          sharedNotes: "",
        },
        ...prev,
      ]);
    }
    setMeetingFormOpen(false);
    setMeetingFormEditingId(null);
  };

  const handleMeetingNotesChange = (
    id: string,
    field: "privateNotes" | "sharedNotes",
    value: string,
  ) => {
    setMeetings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    );
  };

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const now = new Date();
    const uploadedDate = now.toLocaleDateString(undefined, {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
    const picked: ProjectFile[] = Array.from(fileList).map((file) => ({
      id: `uf-${Math.random().toString(16).slice(2)}`,
      fileName: file.name,
      fileType: (file.name.split(".").pop() ?? "file").toUpperCase(),
      uploadedDate,
      uploadedBy: "You",
    }));
    setFiles((prev) => [...picked, ...prev]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openMilestoneModal = (mode: "create" | "edit", ms?: Milestone) => {
    setMilestoneModalMode(mode);
    setMilestoneModalEditingId(ms?.id ?? null);
    if (mode === "create") {
      const twoWeeks = new Date();
      twoWeeks.setDate(twoWeeks.getDate() + 14);
      setMsTitle("New milestone");
      setMsDescription("");
      setMsDueDate(toLocalDate(twoWeeks.toISOString()));
      setMsAmount("$0");
      setMsStatus("pending");
    } else {
      setMsTitle(ms?.title ?? "");
      setMsDescription(ms?.description ?? "");
      setMsDueDate(ms?.dueDateIso ? toLocalDate(ms.dueDateIso) : "");
      setMsAmount(ms?.amount ?? "");
      setMsStatus(ms?.status ?? "pending");
    }
    setMilestoneModalOpen(true);
  };

  const openProjectModal = () => {
    if (!projectDetail) return;
    setPTitle(projectDetail.title ?? "");
    setPDescription(projectDetail.description ?? "");
    setPStatus(toUiProjectStatus(projectDetail.status));
    setPTotalAmount(String(projectDetail.total_amount ?? ""));
    setPAmountPaid(String(projectDetail.amount_paid ?? ""));
    setPStartDate(toLocalDateTime(projectDetail.start_date ?? ""));
    setPEndDate(toLocalDateTime(projectDetail.end_date ?? ""));
    setProjectModalOpen(true);
  };

  function parseMoneyToNumber(value: string) {
    const cleaned = value.replace(/[^\d.]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }

  function uiMilestoneStatusToApi(status: MilestoneStatus) {
    if (status === "in-progress") return "in_progress";
    return status;
  }

  function uiProjectStatusToApi(status: ProjectStatus) {
    if (status === "in-progress") return "in_progress";
    return status;
  }

  function parseDateToIso(value: string) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return new Date().toISOString();
    return d.toISOString();
  }

  const handleMilestoneSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const title = msTitle.trim();
    const dueDate = msDueDate.trim();
    const amount = msAmount.trim();
    if (!title || !dueDate || !amount) return;

    if (!projectDetail) return;

    const payload = {
      title,
      description: msDescription.trim(),
      status: uiMilestoneStatusToApi(msStatus),
      price: parseMoneyToNumber(amount),
      due_date: parseDateToIso(dueDate),
      project_id: projectDetail.id,
    };

    if (milestoneModalMode === "edit" && milestoneModalEditingId) {
      const milestoneIdNum = Number(milestoneModalEditingId);
      updateMilestoneMutation
        .mutateAsync({ milestoneId: milestoneIdNum, data: payload })
        .then((res) => {
          if (!res.success) {
            toast.error(res.message || "Failed to update milestone.");
            return;
          }
          if (res.data) patchMilestoneInCache(res.data);
          if (res.data) {
            const ui = toUiMilestone(res.data);
            setMilestoneState((prev) =>
              prev.map((m) => (m.id === ui.id ? ui : m)),
            );
          }
          toast.success(res.message || "Milestone updated.");
          return queryClient.invalidateQueries({
            queryKey: projectDetailQueryKey,
          });
        })
        .finally(() => {
          setMilestoneModalOpen(false);
          setMilestoneModalEditingId(null);
        });
      return;
    }

    createMilestoneMutation
      .mutateAsync(payload as never)
      .then((res) => {
        if (!res.success) {
          toast.error(res.message || "Failed to create milestone.");
          return;
        }
        if (res.data) patchMilestoneInCache(res.data);
        if (res.data) {
          const ui = toUiMilestone(res.data);
          setMilestoneState((prev) => [...prev, ui]);
        }
        toast.success(res.message || "Milestone created.");
        return queryClient.invalidateQueries({
          queryKey: projectDetailQueryKey,
        });
      })
      .finally(() => {
        setMilestoneModalOpen(false);
        setMilestoneModalEditingId(null);
      });
  };

  const handleMilestoneStatusChange = (
    milestoneId: string,
    status: MilestoneStatus,
  ) => {
    setMilestoneState((prev) =>
      prev.map((m) => (m.id === milestoneId ? { ...m, status } : m)),
    );
    setOpenStatusDropdown(null);

    const milestoneIdNum = Number(milestoneId);
    updateMilestoneMutation
      .mutateAsync({
        milestoneId: milestoneIdNum,
        data: { status: uiMilestoneStatusToApi(status) },
      })
      .then((res) => {
        if (!res.success) {
          toast.error(res.message || "Failed to update milestone.");
          return;
        }
        if (res.data) patchMilestoneInCache(res.data);
        if (res.data) {
          const ui = toUiMilestone(res.data);
          setMilestoneState((prev) =>
            prev.map((m) => (m.id === ui.id ? ui : m)),
          );
        }
        toast.success(res.message || "Milestone updated.");
        return queryClient.invalidateQueries({
          queryKey: projectDetailQueryKey,
        });
      })
      .catch(() => {});
  };

  const handleMilestoneDelete = (milestoneId: string) => {
    const ok = window.confirm("Delete this milestone? This cannot be undone.");
    if (!ok) return;
    setMilestoneState((prev) => prev.filter((m) => m.id !== milestoneId));
    setExpandedMilestones((prev) => {
      const next = { ...prev };
      delete next[milestoneId];
      return next;
    });

    deleteMilestoneMutation
      .mutateAsync({ milestoneId: Number(milestoneId) } as never)
      .then((res) => {
        if (!res.success) {
          toast.error(res.message || "Failed to delete milestone.");
          return;
        }
        removeMilestoneFromCache(Number(milestoneId));
        toast.success(res.message || "Milestone deleted.");
        return queryClient.invalidateQueries({
          queryKey: projectDetailQueryKey,
        });
      })
      .catch(() => {});
  };

  const openTaskModal = (milestoneId: string) => {
    setTaskModalMode("create");
    setTaskModalMilestoneId(milestoneId);
    setTaskModalEditingId(null);
    setTaskTitle("New task");
    setTaskDescription("");
    setTaskModalOpen(true);
  };

  const editTask = (milestoneId: string, task: TaskItem) => {
    setTaskModalMode("edit");
    setTaskModalMilestoneId(milestoneId);
    setTaskModalEditingId(task.id);
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskModalOpen(true);
  };

  const handleTaskSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const title = taskTitle.trim();
    const description = taskDescription.trim();
    if (!title) return;
    if (!taskModalMilestoneId) return;

    if (taskModalMode === "edit" && taskModalEditingId) {
      const taskIdNum = Number(taskModalEditingId);
      updateTaskMutation
        .mutateAsync({ taskId: taskIdNum, data: { title, description } })
        .then((res) => {
          if (!res.success) {
            toast.error(res.message || "Failed to update task.");
            return;
          }
          if (res.data) patchTaskInCache(Number(taskModalMilestoneId), res.data);
          if (res.data) {
            const uiTask = toUiTask(res.data);
            setMilestoneState((prev) =>
              prev.map((m) =>
                m.id === taskModalMilestoneId
                  ? {
                      ...m,
                      tasks: m.tasks.map((t) =>
                        t.id === uiTask.id ? uiTask : t,
                      ),
                    }
                  : m,
              ),
            );
          }
          toast.success(res.message || "Task updated.");
          return queryClient.invalidateQueries({
            queryKey: projectDetailQueryKey,
          });
        })
        .finally(() => setTaskModalOpen(false));
      return;
    }

    createTaskMutation
      .mutateAsync({
        title,
        description,
        milestone_id: Number(taskModalMilestoneId),
      } as never)
      .then((res) => {
        if (!res.success) {
          toast.error(res.message || "Failed to create task.");
          return;
        }
        if (res.data) patchTaskInCache(Number(taskModalMilestoneId), res.data);
        if (res.data) {
          const uiTask = toUiTask(res.data);
          setMilestoneState((prev) =>
            prev.map((m) =>
              m.id === taskModalMilestoneId
                ? { ...m, tasks: [...m.tasks, uiTask] }
                : m,
            ),
          );
        }
        toast.success(res.message || "Task created.");
        return queryClient.invalidateQueries({
          queryKey: projectDetailQueryKey,
        });
      })
      .finally(() => setTaskModalOpen(false));
  };

  const deleteTaskForMilestone = (milestoneId: string, taskId: string) => {
    const ok = window.confirm("Delete this task? This cannot be undone.");
    if (!ok) return;
    setMilestoneState((prev) =>
      prev.map((m) =>
        m.id === milestoneId
          ? { ...m, tasks: m.tasks.filter((t) => t.id !== taskId) }
          : m,
      ),
    );

    deleteTaskMutation
      .mutateAsync({ taskId: Number(taskId) } as never)
      .then((res) => {
        if (!res.success) {
          toast.error(res.message || "Failed to delete task.");
          return;
        }
        removeTaskFromCache(Number(milestoneId), Number(taskId));
        toast.success(res.message || "Task deleted.");
        return queryClient.invalidateQueries({
          queryKey: projectDetailQueryKey,
        });
      })
      .catch(() => {});
  };

  const handleProjectSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!projectDetail) return;

    const update: ProjectUpdate = {
      title: pTitle.trim() || undefined,
      description: pDescription.trim() || undefined,
      status: uiProjectStatusToApi(pStatus) as never,
      total_amount: pTotalAmount ? Number(pTotalAmount) : undefined,
      amount_paid: pAmountPaid ? Number(pAmountPaid) : undefined,
      start_date: pStartDate || undefined,
      end_date: pEndDate || undefined,
    };

    updateProjectMutation
      .mutateAsync({ projectId: projectDetail.id, data: update })
      .then((res) => {
        if (!res.success) {
          toast.error(res.message || "Failed to update project.");
          return;
        }
        if (res.data) {
          // Patch the project detail cache immediately
          setProjectDetailCache((prev) => {
            if (!prev?.data) return prev;
            return { ...prev, data: { ...prev.data, ...res.data } };
          });

          // Patch any cached project lists immediately
          queryClient.setQueriesData(
            { predicate: (q) => (q.queryKey?.[0] as string) === "projects" },
            (old) => {
              const prev = old as APIResponse<ProjectReadWithMilestones[]> | undefined;
              if (!prev?.data) return old;
              return {
                ...prev,
                data: prev.data.map((p) =>
                  p.id === res.data!.id ? ({ ...p, ...res.data } as never) : p,
                ),
              };
            },
          );
        }
        toast.success(res.message || "Project updated.");
        if (res.data) {
          setProjectSummary((prev) => ({
            ...prev,
            title: res.data?.title ?? prev.title,
            description: res.data?.description ?? prev.description,
            status: toUiProjectStatus(res.data?.status),
            startDate: res.data?.start_date
              ? formatLongDate(res.data.start_date)
              : prev.startDate,
            endDate: res.data?.end_date
              ? formatLongDate(res.data.end_date)
              : prev.endDate,
            totalAmount:
              typeof res.data?.total_amount === "number"
                ? formatMoney(res.data.total_amount)
                : prev.totalAmount,
            paidAmount:
              typeof res.data?.amount_paid === "number"
                ? formatMoney(res.data.amount_paid)
                : prev.paidAmount,
          }));
        }
        return Promise.all([
          queryClient.invalidateQueries({
            queryKey: projectDetailQueryKey,
          }),
          queryClient.invalidateQueries({ queryKey: queryKeys.projects.all }),
        ]);
      })
      .finally(() => setProjectModalOpen(false));
  };

  const handleProjectDelete = () => {
    if (!projectDetail) return;
    const ok = window.confirm("Delete this project? This cannot be undone.");
    if (!ok) return;

    deleteProjectMutation
      .mutateAsync({ projectId: projectDetail.id } as never)
      .then((res) => {
        if (!res.success) {
          toast.error(res.message || "Failed to delete project.");
          return;
        }
        queryClient.setQueriesData(
          { predicate: (q) => (q.queryKey?.[0] as string) === "projects" },
          (old) => {
            const prev = old as APIResponse<ProjectReadWithMilestones[]> | undefined;
            if (!prev?.data) return old;
            return { ...prev, data: prev.data.filter((p) => p.id !== projectDetail.id) };
          },
        );
        toast.success(res.message || "Project deleted.");
        return queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      })
      .then(() => router.push("/projects"))
      .catch(() => {});
  };

  // ─────────────────────────────────────── Render ──

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">

      {/* ── Project Header ─────────────────────────────── */}
      <header className="space-y-3 border-b border-border pb-5">
        {projectError ? (
          <p className="text-sm text-destructive">
            {projectError.message || "Failed to load project."}
          </p>
        ) : projectRes && projectRes.success === false ? (
          <p className="text-sm text-destructive">
            {projectRes.message || "Failed to load project."}
          </p>
        ) : null}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-3xl font-semibold text-foreground">
            {projectSummary.title}
          </h1>
          <div className="flex items-center gap-2">
            <StatusBadge status={projectSummary.status} />
            <button
              type="button"
              onClick={openProjectModal}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card px-3 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
          </div>
        </div>
        <p className="max-w-3xl text-sm text-muted-foreground">
          {projectSummary.description}
        </p>
        <div className="flex flex-wrap gap-6 text-sm">
          <span>
            <span className="text-muted-foreground">Start:</span>{" "}
            {projectSummary.startDate}
          </span>
          <span>
            <span className="text-muted-foreground">End:</span>{" "}
            {projectSummary.endDate}
          </span>
          <span>
            <span className="text-muted-foreground">Budget:</span>{" "}
            {projectSummary.paidAmount} paid / {projectSummary.totalAmount}{" "}
            total
          </span>
        </div>
      </header>

      {/* ── Milestone Step Tracker ─────────────────────── */}
      {isProjectLoading ? (
        <p className="text-sm text-muted-foreground">Loading project details…</p>
      ) : (
        <MilestoneStepTracker milestoneItems={sortedMilestones} />
      )}

      {/* ── Tab Nav ────────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex gap-0.5 overflow-x-auto py-1.5">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setMeetingNotesId(null);
              }}
              className={`rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition ${
                activeTab === tab
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════ TAB PANELS ═══════════════════════════ */}

      {activeTab === "Overview" ? (
        <OverviewPanel
          summary={projectSummary}
          nextMilestone={nextMilestone}
          completedMilestones={completedMilestones}
          totalMilestones={milestoneState.length}
        />
      ) : null}

      {activeTab === "Milestones" ? (
        <MilestonesPanel
          milestones={sortedMilestones}
          sortValue={milestoneSort}
          onSortChange={setMilestoneSort}
          expandedMilestones={expandedMilestones}
          onToggleExpand={(id) =>
            setExpandedMilestones((prev) => ({
              ...prev,
              [id]: !prev[id],
            }))
          }
          openStatusDropdown={openStatusDropdown}
          onStatusDropdownToggle={(id) =>
            setOpenStatusDropdown(openStatusDropdown === id ? null : id)
          }
          onStatusChange={handleMilestoneStatusChange}
          onDelete={handleMilestoneDelete}
          onOpenModal={openMilestoneModal}
          onOpenTaskModal={openTaskModal}
          onEditTask={editTask}
          onDeleteTask={deleteTaskForMilestone}
          milestoneModalOpen={milestoneModalOpen}
          milestoneModalMode={milestoneModalMode}
          onCloseModal={() => {
            setMilestoneModalOpen(false);
            setMilestoneModalEditingId(null);
          }}
          msTitle={msTitle}
          setMsTitle={setMsTitle}
          msDescription={msDescription}
          setMsDescription={setMsDescription}
          msDueDate={msDueDate}
          setMsDueDate={setMsDueDate}
          msAmount={msAmount}
          setMsAmount={setMsAmount}
          msStatus={msStatus}
          setMsStatus={setMsStatus}
          onMilestoneSubmit={handleMilestoneSubmit}

          taskModalOpen={taskModalOpen}
          taskModalMode={taskModalMode}
          onCloseTaskModal={() => setTaskModalOpen(false)}
          taskTitle={taskTitle}
          setTaskTitle={setTaskTitle}
          taskDescription={taskDescription}
          setTaskDescription={setTaskDescription}
          onTaskSubmit={handleTaskSubmit}
        />
      ) : null}

      <Modal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        title="Edit Project"
        subtitle="Update the project’s core details."
      >
        <form onSubmit={handleProjectSubmit} className="grid gap-4 md:grid-cols-2">
          <Field label="Title" wide>
            <input value={pTitle} onChange={(e) => setPTitle(e.target.value)} className={inputCls} />
          </Field>

          <Field label="Description" wide>
            <textarea
              value={pDescription}
              onChange={(e) => setPDescription(e.target.value)}
              className="min-h-[88px] w-full resize-none rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </Field>

          <Field label="Status">
            <select
              value={pStatus}
              onChange={(e) => setPStatus(e.target.value as ProjectStatus)}
              className={selectCls}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </Field>

          <Field label="Total Amount">
            <input
              value={pTotalAmount}
              onChange={(e) => setPTotalAmount(e.target.value)}
              placeholder="e.g. 4500"
              className={inputCls}
            />
          </Field>

          <Field label="Amount Paid">
            <input
              value={pAmountPaid}
              onChange={(e) => setPAmountPaid(e.target.value)}
              placeholder="e.g. 3600"
              className={inputCls}
            />
          </Field>

          <Field label="Start date & time" wide>
            <div className="relative">
              <input
                ref={startDateInputRef}
                type="datetime-local"
                value={pStartDate}
                onChange={(e) => setPStartDate(e.target.value)}
                className={`${inputCls} pr-11 appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-10`}
              />
              <button
                type="button"
                onClick={() => {
                  const el = startDateInputRef.current;
                  if (!el) return;
                  el.focus();
                  (el as unknown as { showPicker?: () => void }).showPicker?.();
                }}
                className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Pick start date"
              >
                <Calendar className="h-4 w-4" />
              </button>
            </div>
          </Field>

          <Field label="End date & time" wide>
            <div className="relative">
              <input
                ref={endDateInputRef}
                type="datetime-local"
                value={pEndDate}
                onChange={(e) => setPEndDate(e.target.value)}
                className={`${inputCls} pr-11 appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-10`}
              />
              <button
                type="button"
                onClick={() => {
                  const el = endDateInputRef.current;
                  if (!el) return;
                  el.focus();
                  (el as unknown as { showPicker?: () => void }).showPicker?.();
                }}
                className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Pick end date"
              >
                <Calendar className="h-4 w-4" />
              </button>
            </div>
          </Field>

          <div className="md:col-span-2 flex flex-wrap justify-between gap-2 pt-1">
            <Button
              type="button"
              className="h-10"
              onClick={handleProjectDelete}
              variant="outline"
              aria-label="Delete project"
              style={{ borderColor: "var(--destructive)", color: "var(--destructive)" }}
            >
              Delete Project
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-10"
                onClick={() => setProjectModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="h-10">
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {activeTab === "Files" ? (
        <FilesPanel
          files={files}
          fileInputRef={fileInputRef}
          onFilesSelected={handleFilesSelected}
          onDeleteFile={(id) =>
            setFiles((prev) => prev.filter((f) => f.id !== id))
          }
        />
      ) : null}

      {activeTab === "Comments" ? (
        <CommentsPanel
          comments={comments}
          commentDraft={commentDraft}
          setCommentDraft={setCommentDraft}
          onSend={handleSendComment}
        />
      ) : null}

      {activeTab === "Meetings" ? (
        <MeetingsPanel
          meetings={meetings}
          meetingNotesId={meetingNotesId}
          setMeetingNotesId={setMeetingNotesId}
          onMeetingNotesChange={handleMeetingNotesChange}
          meetingFormOpen={meetingFormOpen}
          meetingFormMode={meetingFormMode}
          onOpenMeetingForm={openMeetingForm}
          onCloseMeetingForm={() => setMeetingFormOpen(false)}
          mtTitle={mtTitle}
          setMtTitle={setMtTitle}
          mtLink={mtLink}
          setMtLink={setMtLink}
          mtDateTime={mtDateTime}
          setMtDateTime={setMtDateTime}
          mtDescription={mtDescription}
          setMtDescription={setMtDescription}
          onMeetingSubmit={handleMeetingSubmit}
        />
      ) : null}

      {activeTab === "Notes" ? (
        <NotesPanel
          privateNotes={privateNotes}
          setPrivateNotes={setPrivateNotes}
          sharedNotes={sharedNotes}
          setSharedNotes={setSharedNotes}
        />
      ) : null}

      {activeTab === "Payments" ? (
        <PaymentsPanel
          completedMilestones={completedMilestones}
          paymentActions={paymentActions}
          onPay={(id) =>
            setPaymentActions((prev) => ({ ...prev, [id]: "invoice" }))
          }
        />
      ) : null}

      {activeTab === "Activity" ? (
        <ActivityPanel logs={activityLogs} />
      ) : null}
    </div>
  );
}
