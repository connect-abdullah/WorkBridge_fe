"use client";

import { FormEvent } from "react";
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  Trash2,
  PencilLine,
} from "lucide-react";
import {
  type Milestone,
  type MilestoneStatus,
  type TaskItem,
} from "@/constants/project-detail";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/project-detail/components/Modal";
import {
  Field,
  inputCls,
  selectCls,
} from "@/components/project-detail/components/Field";
import type { Permissions } from "@/lib/permissions";

export function MilestonesPanel({
  permissions,
  milestones,
  sortValue,
  onSortChange,
  expandedMilestones,
  onToggleExpand,
  openStatusDropdown,
  onStatusDropdownToggle,
  onStatusChange,
  onDelete,
  onApprove,
  milestoneUpdateBusy,
  milestoneCreateBusy,
  onOpenModal,
  onOpenTaskModal,
  onEditTask,
  onDeleteTask,
  milestoneModalOpen,
  milestoneModalMode,
  onCloseModal,
  msTitle,
  setMsTitle,
  msDescription,
  setMsDescription,
  msDueDate,
  setMsDueDate,
  msAmount,
  setMsAmount,
  msStatus,
  setMsStatus,
  msApprovalStatus,
  onMilestoneSubmit,

  taskModalOpen,
  taskModalMode,
  onCloseTaskModal,
  taskTitle,
  setTaskTitle,
  taskDescription,
  setTaskDescription,
  onTaskSubmit,
}: {
  permissions: Permissions;
  milestones: Milestone[];
  sortValue: "dueDate" | "order";
  onSortChange: (v: "dueDate" | "order") => void;
  expandedMilestones: Record<string, boolean>;
  onToggleExpand: (id: string) => void;
  openStatusDropdown: string | null;
  onStatusDropdownToggle: (id: string) => void;
  onStatusChange: (id: string, status: MilestoneStatus) => void;
  onDelete: (id: string) => void;
  onApprove?: (id: string) => void;
  /** True while a milestone PUT (status, edit form, or client approve) is in flight. */
  milestoneUpdateBusy: boolean;
  /** True while creating a milestone from the modal. */
  milestoneCreateBusy: boolean;
  onOpenModal: (mode: "create" | "edit", ms?: Milestone) => void;
  onOpenTaskModal: (milestoneId: string) => void;
  onEditTask: (milestoneId: string, task: TaskItem) => void;
  onDeleteTask: (milestoneId: string, taskId: string) => void;
  milestoneModalOpen: boolean;
  milestoneModalMode: "create" | "edit";
  onCloseModal: () => void;
  msTitle: string;
  setMsTitle: (v: string) => void;
  msDescription: string;
  setMsDescription: (v: string) => void;
  msDueDate: string;
  setMsDueDate: (v: string) => void;
  msAmount: string;
  setMsAmount: (v: string) => void;
  msStatus: MilestoneStatus;
  setMsStatus: (v: MilestoneStatus) => void;
  msApprovalStatus: Milestone["approvalStatus"];
  onMilestoneSubmit: (e: FormEvent<HTMLFormElement>) => void;

  taskModalOpen: boolean;
  taskModalMode: "create" | "edit";
  onCloseTaskModal: () => void;
  taskTitle: string;
  setTaskTitle: (v: string) => void;
  taskDescription: string;
  setTaskDescription: (v: string) => void;
  onTaskSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) {
  const approvalCapsule = (value?: Milestone["approvalStatus"]) => {
    const v = value ?? "pending";
    const label =
      v === "revision-requested"
        ? "Revision"
        : v.charAt(0).toUpperCase() + v.slice(1).replace("-", " ");
    const cls =
      v === "approved"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
        : v === "rejected"
          ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
          : v === "revision-requested"
            ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
            : v === "pending"
              ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
              : "border-border bg-muted/60 text-muted-foreground";

    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${cls}`}
        title={`Approval: ${label}`}
      >
        {label}
      </span>
    );
  };

  return (
    <section className="w-full min-w-0 max-w-full space-y-4 pr-[max(0px,env(safe-area-inset-right))]">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex min-w-0 max-w-full items-center gap-2 sm:max-w-[min(100%,20rem)]">
          <span className="shrink-0 text-xs font-medium text-muted-foreground">
            Sort
          </span>
          <div className="flex min-w-0 flex-1">
            <select
              value={sortValue}
              onChange={(e) =>
                onSortChange(e.target.value as "dueDate" | "order")
              }
              className={`${selectCls} h-9 min-w-0 max-w-full flex-1 rounded-lg bg-background px-3 text-sm shadow-sm sm:text-sm`}
              aria-label="Sort milestones"
            >
              <option value="dueDate">Due date</option>
              <option value="order">Order</option>
            </select>
          </div>
        </div>
        {permissions.canCreateMilestone ? (
          <Button
            className="h-10 w-full shrink-0 sm:w-auto"
            onClick={() => onOpenModal("create")}
            disabled={milestoneCreateBusy || milestoneUpdateBusy}
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add Milestone
          </Button>
        ) : null}
      </div>

      <div className="space-y-3">
        {milestones.map((milestone, idx) => {
          const hasTasks = milestone.tasks.length > 0;
          const isOpen = !!expandedMilestones[milestone.id];
          const isDropdownOpen = openStatusDropdown === milestone.id;
          const isApproved = milestone.approvalStatus === "approved";

          return (
            <article
              key={milestone.id}
              className="min-w-0 max-w-full rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 text-xs font-semibold text-foreground">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground">
                        {milestone.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                  {approvalCapsule(milestone.approvalStatus)}
                  {isApproved ? (
                    <div className="relative">
                      {milestone.status === "paid" ? (
                        <StatusBadge status="paid" label="Paid" />
                      ) : (
                        <button
                          type="button"
                          onClick={
                            permissions.canChangeMilestoneProgress &&
                            !milestoneUpdateBusy
                              ? () => onStatusDropdownToggle(milestone.id)
                              : undefined
                          }
                          disabled={
                            !permissions.canChangeMilestoneProgress ||
                            milestoneUpdateBusy
                          }
                          className={`rounded-full focus:outline-none ${
                            permissions.canChangeMilestoneProgress &&
                            !milestoneUpdateBusy
                              ? "cursor-pointer"
                              : "cursor-default"
                          }`}
                          aria-label="Change progress status"
                        >
                          <StatusBadge status={milestone.status} />
                        </button>
                      )}

                      {isDropdownOpen &&
                      permissions.canChangeMilestoneProgress &&
                      !milestoneUpdateBusy ? (
                        <div className="absolute left-0 right-0 top-full z-30 mt-1.5 overflow-hidden rounded-lg border border-border bg-card shadow-md sm:left-auto sm:right-0 sm:w-40">
                          {(
                            [
                              "pending",
                              "in-progress",
                              "completed",
                            ] as MilestoneStatus[]
                          ).map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => onStatusChange(milestone.id, s)}
                              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-muted ${
                                milestone.status === s
                                  ? "font-medium text-primary"
                                  : "text-foreground"
                              }`}
                            >
                              <StatusBadge status={s} />
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {permissions.canApproveMilestone &&
                  milestone.approvalStatus === "pending" &&
                  onApprove ? (
                    <Button
                      type="button"
                      size="sm"
                      className="h-8"
                      onClick={() => onApprove(milestone.id)}
                      disabled={milestoneUpdateBusy}
                    >
                      <Check className="mr-1 h-3.5 w-3.5" /> Approve
                    </Button>
                  ) : null}

                  {permissions.canEditMilestone ? (
                    <button
                      type="button"
                      onClick={() => onOpenModal("edit", milestone)}
                      disabled={milestoneUpdateBusy}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                      aria-label="Edit milestone"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  ) : null}

                  {permissions.canDeleteMilestone ? (
                    <button
                      type="button"
                      onClick={() => onDelete(milestone.id)}
                      disabled={milestoneUpdateBusy}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition hover:bg-muted hover:text-destructive disabled:pointer-events-none disabled:opacity-40"
                      aria-label="Delete milestone"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <span>
                  <span className="text-muted-foreground">Due:</span>{" "}
                  {milestone.dueDate}
                </span>
                <span>
                  <span className="text-muted-foreground">Price:</span>{" "}
                  {milestone.amount}
                </span>

                {hasTasks ? (
                  <button
                    type="button"
                    onClick={() => onToggleExpand(milestone.id)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border/70 bg-background px-3 text-xs font-semibold text-foreground shadow-sm transition hover:bg-muted/60 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    aria-expanded={isOpen}
                  >
                    {isOpen ? (
                      <>
                        <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Hide tasks</span>
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                          {milestone.tasks.length}
                        </span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Show tasks</span>
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                          {milestone.tasks.length}
                        </span>
                      </>
                    )}
                  </button>
                ) : null}
              </div>

              {hasTasks && isOpen ? (
                <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Task List
                  </p>
                  <div className="space-y-2">
                    {milestone.tasks.map((task, i) => (
                      <div
                        key={task.id}
                        className="flex flex-col gap-2 rounded-md border border-border/70 bg-background px-3 py-2 sm:flex-row sm:items-start sm:gap-3"
                      >
                        <span className="mt-0.5 text-xs font-semibold text-muted-foreground sm:shrink-0">
                          {i + 1}.
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {task.title}
                          </p>
                          {task.description ? (
                            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                              {task.description}
                            </p>
                          ) : null}
                        </div>
                        {permissions.canEditTask ||
                        permissions.canDeleteTask ? (
                          <div className="flex shrink-0 items-center justify-end gap-1.5 sm:justify-start">
                            {permissions.canEditTask ? (
                              <button
                                type="button"
                                onClick={() => onEditTask(milestone.id, task)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                aria-label="Edit task"
                              >
                                <PencilLine className="h-3.5 w-3.5" />
                              </button>
                            ) : null}
                            {permissions.canDeleteTask ? (
                              <button
                                type="button"
                                onClick={() =>
                                  onDeleteTask(milestone.id, task.id)
                                }
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition hover:bg-muted hover:text-destructive"
                                aria-label="Delete task"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  {permissions.canCreateTask ? (
                    <Button
                      variant="outline"
                      className="mt-3 h-9"
                      onClick={() => onOpenTaskModal(milestone.id)}
                    >
                      <Plus className="mr-1.5 h-4 w-4" /> Add Task
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <Modal
        open={milestoneModalOpen}
        onClose={onCloseModal}
        title={
          milestoneModalMode === "create" ? "Add Milestone" : "Edit Milestone"
        }
        subtitle="Fill in all fields to track this delivery milestone clearly."
      >
        <form
          onSubmit={onMilestoneSubmit}
          className="grid gap-4 md:grid-cols-2"
        >
          <Field label="Milestone Title" wide>
            <input
              value={msTitle}
              onChange={(e) => setMsTitle(e.target.value)}
              placeholder="e.g. Dashboard UX handoff"
              className={inputCls}
            />
          </Field>

          <Field label="Description" wide>
            <textarea
              value={msDescription}
              onChange={(e) => setMsDescription(e.target.value)}
              placeholder="What does this milestone cover?"
              className="min-h-[88px] w-full resize-none rounded-md border border-input bg-input-background px-3 py-2.5 text-sm text-input-foreground outline-none transition placeholder:text-neutral-500 dark:placeholder:text-neutral-600 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/35"
            />
          </Field>

          <Field label="Status">
            <div className="space-y-1.5">
              <select
                value={msStatus}
                onChange={(e) => setMsStatus(e.target.value as MilestoneStatus)}
                className={selectCls}
                disabled={
                  msStatus === "paid" ||
                  (milestoneModalMode === "edit" &&
                    msApprovalStatus !== "approved")
                }
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                {msStatus === "paid" ? (
                  <option value="paid">Paid</option>
                ) : null}
              </select>
              {msStatus === "paid" ? (
                <p className="text-xs text-muted-foreground">
                  Locked after payment approval.
                </p>
              ) : milestoneModalMode === "edit" &&
                msApprovalStatus !== "approved" ? (
                <p className="text-xs text-muted-foreground">
                  Available once approved.
                </p>
              ) : null}
            </div>
          </Field>

          <Field label="Due Date">
            <div className="relative">
              <input
                type="date"
                value={msDueDate}
                onChange={(e) => setMsDueDate(e.target.value)}
                className={`${inputCls} pr-11 appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-10`}
              />
              <button
                type="button"
                onClick={(e) => {
                  const root = (e.currentTarget.parentElement ??
                    null) as HTMLElement | null;
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

          <Field label="Milestone Price" wide>
            <input
              value={msAmount}
              onChange={(e) => setMsAmount(e.target.value)}
              placeholder="$1,200"
              className={inputCls}
            />
          </Field>

          <div className="md:col-span-2 flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={onCloseModal}
              disabled={milestoneCreateBusy || milestoneUpdateBusy}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-10"
              disabled={
                milestoneModalMode === "create"
                  ? milestoneCreateBusy
                  : milestoneUpdateBusy
              }
            >
              {milestoneModalMode === "create"
                ? milestoneCreateBusy
                  ? "Creating…"
                  : "Create Milestone"
                : milestoneUpdateBusy
                  ? "Saving…"
                  : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={taskModalOpen}
        onClose={onCloseTaskModal}
        title={taskModalMode === "create" ? "Add Task" : "Edit Task"}
        subtitle="Add clear tasks so both sides understand what’s included."
        maxWidth="max-w-xl"
      >
        <form onSubmit={onTaskSubmit} className="grid gap-4">
          <Field label="Title" wide>
            <input
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Implement milestone tracker UI"
              className={inputCls}
            />
          </Field>

          <Field label="Description" wide>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Add a short description to remove ambiguity."
              className="min-h-[88px] w-full resize-none rounded-md border border-input bg-input-background px-3 py-2.5 text-sm text-input-foreground outline-none transition placeholder:text-neutral-500 dark:placeholder:text-neutral-600 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/35"
            />
          </Field>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={onCloseTaskModal}
            >
              Cancel
            </Button>
            <Button type="submit" className="h-10">
              {taskModalMode === "create" ? "Create Task" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
