"use client";

import { FormEvent } from "react";
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";
import {
  type Milestone,
  type MilestoneStatus,
} from "@/constants/project-detail";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/project-detail/components/Modal";
import { Field, inputCls, selectCls } from "@/components/project-detail/components/Field";

export function MilestonesPanel({
  milestones,
  expandedMilestones,
  onToggleExpand,
  openStatusDropdown,
  onStatusDropdownToggle,
  onStatusChange,
  onDelete,
  onOpenModal,
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
  onMilestoneSubmit,
}: {
  milestones: Milestone[];
  expandedMilestones: Record<string, boolean>;
  onToggleExpand: (id: string) => void;
  openStatusDropdown: string | null;
  onStatusDropdownToggle: (id: string) => void;
  onStatusChange: (id: string, status: MilestoneStatus) => void;
  onDelete: (id: string) => void;
  onOpenModal: (mode: "create" | "edit", ms?: Milestone) => void;
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
  onMilestoneSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="space-y-4">
      <div className="flex justify-end">
        <Button className="h-10" onClick={() => onOpenModal("create")}>
          <Plus className="mr-1.5 h-4 w-4" /> Add Milestone
        </Button>
      </div>

      <div className="space-y-3">
        {milestones.map((milestone) => {
          const hasTasks = milestone.tasks.length > 0;
          const isOpen = !!expandedMilestones[milestone.id];
          const isDropdownOpen = openStatusDropdown === milestone.id;

          return (
            <article
              key={milestone.id}
              className="rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground">
                    {milestone.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {milestone.description}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => onStatusDropdownToggle(milestone.id)}
                      className="cursor-pointer rounded-full focus:outline-none"
                      aria-label="Change status"
                    >
                      <StatusBadge status={milestone.status} />
                    </button>

                    {isDropdownOpen ? (
                      <div className="absolute right-0 top-full z-30 mt-1.5 w-40 overflow-hidden rounded-lg border border-border bg-card shadow-md">
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

                  <button
                    type="button"
                    onClick={() => onOpenModal("edit", milestone)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    aria-label="Edit milestone"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(milestone.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition hover:bg-muted hover:text-destructive"
                    aria-label="Delete milestone"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
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
                    className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary transition hover:bg-primary/10"
                  >
                    {isOpen ? (
                      <>
                        <ChevronUp className="h-3.5 w-3.5" /> Hide Tasks (
                        {milestone.tasks.length})
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3.5 w-3.5" /> Show Tasks (
                        {milestone.tasks.length})
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
                        key={task}
                        className="flex items-start gap-2 rounded-md border border-border/70 bg-background px-3 py-2"
                      >
                        <span className="mt-0.5 text-xs font-semibold text-muted-foreground">
                          {i + 1}.
                        </span>
                        <p className="text-sm text-foreground">{task}</p>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="mt-3 h-9">
                    <Plus className="mr-1.5 h-4 w-4" /> Add Task
                  </Button>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <Modal
        open={milestoneModalOpen}
        onClose={onCloseModal}
        title={milestoneModalMode === "create" ? "Add Milestone" : "Edit Milestone"}
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
              className="min-h-[88px] w-full resize-none rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </Field>

          <Field label="Status">
            <select
              value={msStatus}
              onChange={(e) => setMsStatus(e.target.value as MilestoneStatus)}
              className={selectCls}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </Field>

          <Field label="Due Date">
            <input
              value={msDueDate}
              onChange={(e) => setMsDueDate(e.target.value)}
              placeholder="Apr 30, 2026"
              className={inputCls}
            />
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
            >
              Cancel
            </Button>
            <Button type="submit" className="h-10">
              {milestoneModalMode === "create" ? "Create Milestone" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
