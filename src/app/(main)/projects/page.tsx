"use client";

import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStoredUserId, queryApi, queryKeys } from "@/lib/queryApi";
import { Modal } from "@/components/project-detail/components/Modal";
import {
  Field,
  inputCls,
  selectCls,
} from "@/components/project-detail/components/Field";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { ProjectCreate } from "@/lib/apis/projects/schema";
import type {
  ProjectMilestoneCreateInput,
  ProjectTaskCreateInput,
  ProjectStatus,
} from "@/lib/apis/projects/schema";
import type { MilestoneStatus } from "@/lib/apis/milestones/schema";
import { toLocalDateTime } from "@/lib/utils";

type DraftTask = ProjectTaskCreateInput & { _cid: string };
type DraftMilestone = Omit<ProjectMilestoneCreateInput, "tasks"> & {
  _cid: string;
  tasks: DraftTask[];
};

function makeCid() {
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}

function formatMoney(amount: number) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount}`;
  }
}

function formatShortDate(dateStr?: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

function formatLongDate(dateStr?: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function milestoneStatusToBadge(status?: string | null) {
  const s = (status ?? "pending").toLowerCase();
  if (s === "in_progress") return "in-progress";
  if (s === "completed") return "completed";
  return "pending";
}

function toIsoFromLocalDateTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

function toLocalDate(isoLike: string) {
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function ProjectsPage() {
  const userId = getStoredUserId() ?? 0;
  const {
    data: res,
    isLoading,
    error,
  } = useQuery({
    ...queryApi.projects.listForUser(userId),
    enabled: userId > 0,
  });
  const data = res?.data ?? [];
  const queryClient = useQueryClient();

  const createProjectMutation = useMutation(
    queryApi.mutations.projects.create(),
  );

  // ── Create Project modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const nowIso = useMemo(() => new Date().toISOString(), []);
  const twoWeeksIso = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString();
  }, []);

  const [pTitle, setPTitle] = useState("New project");
  const [pDescription, setPDescription] = useState("");
  const [pStatus, setPStatus] = useState<ProjectStatus>("pending");
  const [pClientId, setPClientId] = useState("");
  const [pTotalAmount, setPTotalAmount] = useState("0");
  const [pAmountPaid, setPAmountPaid] = useState("0");
  const [pStartDate, setPStartDate] = useState("");
  const [pEndDate, setPEndDate] = useState("");
  const startRef = useRef<HTMLInputElement | null>(null);
  const endRef = useRef<HTMLInputElement | null>(null);

  const [milestones, setMilestones] = useState<DraftMilestone[]>([]);

  useEffect(() => {
    setHydrated(true);
    setPStartDate(toLocalDateTime(nowIso));
    setPEndDate(toLocalDateTime(twoWeeksIso));
    setMilestones([
      {
        _cid: makeCid(),
        title: "Milestone 1",
        description: "",
        progress_status: "pending",
        price: 0,
        due_date: twoWeeksIso,
        tasks: [
          {
            _cid: makeCid(),
            title: "Task 1",
            description: "",
          } as DraftTask,
        ],
      } as DraftMilestone,
    ]);
  }, [nowIso, twoWeeksIso]);

  const openCreateModal = () => {
    setCreateOpen(true);
  };

  const addMilestone = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setMilestones((prev) => [
      ...prev,
      {
        _cid: makeCid(),
        title: `Milestone ${prev.length + 1}`,
        description: "",
        progress_status: "pending",
        price: 0,
        due_date: d.toISOString(),
        tasks: [],
      } as DraftMilestone,
    ]);
  };

  const deleteMilestone = (index: number) => {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  };

  const addTask = (msIndex: number) => {
    setMilestones((prev) =>
      prev.map((m, i) =>
        i !== msIndex
          ? m
          : ({
              ...m,
              tasks: [
                ...(m.tasks ?? []),
                {
                  _cid: makeCid(),
                  title: `Task ${(m.tasks?.length ?? 0) + 1}`,
                  description: "",
                } as DraftTask,
              ],
            } as DraftMilestone),
      ),
    );
  };

  const deleteTask = (msIndex: number, taskIndex: number) => {
    setMilestones((prev) =>
      prev.map((m, i) =>
        i !== msIndex
          ? m
          : ({
              ...m,
              tasks: (m.tasks ?? []).filter((_, t) => t !== taskIndex),
            } as DraftMilestone),
      ),
    );
  };

  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pTitle.trim()) return;
    const clientIdNum = Number(pClientId);
    if (!Number.isFinite(clientIdNum) || clientIdNum <= 0) {
      toast.error("Client ID is required.");
      return;
    }

    const payload: ProjectCreate = {
      title: pTitle.trim(),
      description: pDescription.trim(),
      status: pStatus,
      freelancer_id: userId,
      client_id: clientIdNum,
      total_amount: Number(pTotalAmount) || 0,
      amount_paid: Number(pAmountPaid) || 0,
      start_date: toIsoFromLocalDateTime(pStartDate),
      end_date: toIsoFromLocalDateTime(pEndDate),
      milestones: (milestones ?? []).map((m) => ({
        title: String(m.title ?? "").trim(),
        description: String(m.description ?? "").trim(),
        progress_status: (((m as { progress_status?: string | null })
          .progress_status ?? "pending") as MilestoneStatus),
        price: Number(m.price) || 0,
        due_date: m.due_date || new Date().toISOString(),
        tasks: (m.tasks ?? []).map((t) => ({
          title: String(t.title ?? "").trim(),
          description: String(t.description ?? "").trim(),
        })),
      })),
    };

    const res = await createProjectMutation.mutateAsync(payload as never);
    if (!res.success) {
      toast.error(res.message || "Failed to create project.");
      return;
    }
    toast.success(res.message || "Project created.");
    setCreateOpen(false);

    // Refresh and patch list cache
    await queryClient.invalidateQueries({
      queryKey: queryKeys.projects.listForUser(userId),
    });
    await queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground">
            View active engagements, milestones, and progress.
          </p>
        </div>
        <Button className="h-10" onClick={openCreateModal}>
          <Plus className="mr-1.5 h-4 w-4" /> Add Project
        </Button>
      </header>

      <section className="space-y-3 flex flex-col">
        {userId <= 0 ? (
          <p className="text-sm text-muted-foreground">
            Sign in to view your projects.
          </p>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground">Loading projects…</p>
        ) : error ? (
          <p className="text-sm text-destructive">
            {error.message || "Failed to load projects."}
          </p>
        ) : res && res.success === false ? (
          <p className="text-sm text-destructive">
            {res.message || "Failed to load projects."}
          </p>
        ) : (data?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">
            {res?.message || "No projects found."}
          </p>
        ) : (
          data!.map((project) => {
            const ms = project.milestones ?? [];
            const total = ms.length || 0;
            const completed = ms.filter((m) => m.progress_status === "completed").length;
            const progress =
              total === 0 ? 0 : Math.round((completed / total) * 100);
            const allCompleted = total > 0 && completed === total;
            const next =
              ms.find((m) => m.progress_status !== "completed") ?? ms[0] ?? null;

            return (
              <ProjectCard
                key={project.id}
                title={project.title}
                clientName={`Client #${project.client_id}`}
                progress={progress}
                milestoneTitle={
                  allCompleted
                    ? "All milestones completed"
                    : (next?.title ?? "No milestones yet")
                }
                milestoneDueDate={
                  allCompleted ? "—" : formatShortDate(next?.due_date)
                }
                milestoneStatus={
                  allCompleted
                    ? ("completed" as never)
                    : (milestoneStatusToBadge(next?.progress_status) as never)
                }
                projectDueDate={formatLongDate(project.end_date)}
                amount={formatMoney(project.total_amount)}
                href={`/projects/${project.id}`}
              />
            );
          })
        )}
      </section>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add Project"
        subtitle="Create a project with milestones and tasks in one go."
        maxWidth="max-w-4xl"
      >
        <form
          onSubmit={handleCreateProject}
          className="grid gap-4 md:grid-cols-2"
        >
          <Field label="Project title" wide>
            <input
              value={pTitle}
              onChange={(e) => setPTitle(e.target.value)}
              className={inputCls}
              placeholder="e.g. Website redesign"
            />
          </Field>

          <Field label="Description" wide>
            <textarea
              value={pDescription}
              onChange={(e) => setPDescription(e.target.value)}
              className="min-h-[88px] w-full resize-none rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="What is this project about?"
            />
          </Field>

          <Field label="Status">
            <select
              value={pStatus}
              onChange={(e) => setPStatus(e.target.value as ProjectStatus)}
              className={selectCls}
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="paid">Paid</option>
            </select>
          </Field>

          <Field label="Client ID">
            <input
              value={pClientId}
              onChange={(e) => setPClientId(e.target.value)}
              className={inputCls}
              placeholder="e.g. 12"
            />
          </Field>

          <Field label="Total amount">
            <input
              value={pTotalAmount}
              onChange={(e) => setPTotalAmount(e.target.value)}
              className={inputCls}
              inputMode="decimal"
            />
          </Field>

          <Field label="Amount paid">
            <input
              value={pAmountPaid}
              onChange={(e) => setPAmountPaid(e.target.value)}
              className={inputCls}
              inputMode="decimal"
            />
          </Field>

          <Field label="Start date & time" wide>
            <div className="relative">
              <input
                ref={startRef}
                type="datetime-local"
                value={pStartDate}
                onChange={(e) => setPStartDate(e.target.value)}
                className={`${inputCls} pr-11 appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-10`}
              />
              <button
                type="button"
                onClick={() => {
                  const el = startRef.current;
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
                ref={endRef}
                type="datetime-local"
                value={pEndDate}
                onChange={(e) => setPEndDate(e.target.value)}
                className={`${inputCls} pr-11 appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-10`}
              />
              <button
                type="button"
                onClick={() => {
                  const el = endRef.current;
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

          <div className="md:col-span-2 space-y-3 pt-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">
                Milestones
              </p>
              <Button
                type="button"
                variant="outline"
                className="h-9"
                onClick={addMilestone}
              >
                <Plus className="mr-1.5 h-4 w-4" /> Add milestone
              </Button>
            </div>

            <div className="space-y-4">
              {milestones.map((m, msIndex) => (
                <div
                  key={m._cid}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      Milestone {msIndex + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => deleteMilestone(msIndex)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition hover:bg-muted hover:text-destructive"
                      aria-label="Delete milestone"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <Field label="Title" wide>
                      <input
                        value={String(m.title ?? "")}
                        onChange={(e) =>
                          setMilestones((prev) =>
                            prev.map((x, i) =>
                              i === msIndex
                                ? ({ ...x, title: e.target.value } as never)
                                : x,
                            ),
                          )
                        }
                        className={inputCls}
                      />
                    </Field>

                    <Field label="Description" wide>
                      <textarea
                        value={String(m.description ?? "")}
                        onChange={(e) =>
                          setMilestones((prev) =>
                            prev.map((x, i) =>
                              i === msIndex
                                ? ({
                                    ...x,
                                    description: e.target.value,
                                  } as never)
                                : x,
                            ),
                          )
                        }
                        className="min-h-[72px] w-full resize-none rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </Field>

                    <Field label="Status">
                      <select
                        value={((m as { progress_status?: string | null }).progress_status ?? "pending") as string}
                        onChange={(e) =>
                          setMilestones((prev) =>
                            prev.map((x, i) =>
                              i === msIndex
                                ? ({ ...x, progress_status: e.target.value } as never)
                                : x,
                            ),
                          )
                        }
                        className={selectCls}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="paid">Paid</option>
                      </select>
                    </Field>

                    <Field label="Price">
                      <input
                        value={String(m.price ?? 0)}
                        onChange={(e) =>
                          setMilestones((prev) =>
                            prev.map((x, i) =>
                              i === msIndex
                                ? ({
                                    ...x,
                                    price: Number(e.target.value),
                                  } as never)
                                : x,
                            ),
                          )
                        }
                        className={inputCls}
                        inputMode="decimal"
                      />
                    </Field>

                    <Field label="Due date">
                      <div className="relative">
                        <input
                          type="date"
                          value={toLocalDate(m.due_date ?? "")}
                          onChange={(e) => {
                            const d = new Date(e.target.value);
                            setMilestones((prev) =>
                              prev.map((x, i) =>
                                i === msIndex
                                  ? ({
                                      ...x,
                                      due_date: d.toISOString(),
                                    } as never)
                                  : x,
                              ),
                            );
                          }}
                          className={`${inputCls} pr-11 appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-10`}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            const root = e.currentTarget
                              .parentElement as HTMLElement | null;
                            const input = root?.querySelector("input") as
                              | (HTMLInputElement & { showPicker?: () => void })
                              | null;
                            if (!input) return;
                            input.focus();
                            input.showPicker?.();
                          }}
                          className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
                          aria-label="Pick due date"
                        >
                          <Calendar className="h-4 w-4" />
                        </button>
                      </div>
                    </Field>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Tasks
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9"
                        onClick={() => addTask(msIndex)}
                      >
                        <Plus className="mr-1.5 h-4 w-4" /> Add task
                      </Button>
                    </div>

                    {(m.tasks ?? []).length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No tasks yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {(m.tasks ?? []).map((t, tIndex) => (
                          <div
                            key={t._cid}
                            className="rounded-lg border border-border bg-background p-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1 space-y-2">
                                <input
                                  value={String(t.title ?? "")}
                                  onChange={(e) =>
                                    setMilestones((prev) =>
                                      prev.map((x, i) => {
                                        if (i !== msIndex) return x;
                                        const tasks = [...(x.tasks ?? [])];
                                        tasks[tIndex] = {
                                          ...tasks[tIndex],
                                          title: e.target.value,
                                        } as DraftTask;
                                        return { ...x, tasks } as never;
                                      }),
                                    )
                                  }
                                  className={inputCls}
                                  placeholder="Task title"
                                />
                                <textarea
                                  value={String(t.description ?? "")}
                                  onChange={(e) =>
                                    setMilestones((prev) =>
                                      prev.map((x, i) => {
                                        if (i !== msIndex) return x;
                                        const tasks = [...(x.tasks ?? [])];
                                        tasks[tIndex] = {
                                          ...tasks[tIndex],
                                          description: e.target.value,
                                        } as DraftTask;
                                        return { ...x, tasks } as never;
                                      }),
                                    )
                                  }
                                  className="min-h-[64px] w-full resize-none rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                  placeholder="Task description"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => deleteTask(msIndex, tIndex)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition hover:bg-muted hover:text-destructive"
                                aria-label="Delete task"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-10"
              disabled={createProjectMutation.isPending}
            >
              {createProjectMutation.isPending ? "Creating…" : "Create Project"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
