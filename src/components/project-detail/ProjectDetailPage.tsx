"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import {
  activityLogs,
  initialComments,
  initialMeetings,
  milestones,
  projectFiles,
  projectSummary,
  type CommentMessage,
  type Meeting,
  type Milestone,
  type MilestoneStatus,
  type ProjectFile,
} from "@/constants/project-detail";
import { StatusBadge } from "@/components/ui/status-badge";

import { MilestoneStepTracker } from "@/components/project-detail/components/MilestoneStepTracker";
import { OverviewPanel } from "@/components/project-detail/components/OverviewPanel";
import { MilestonesPanel } from "@/components/project-detail/components/MilestonesPanel";
import { FilesPanel } from "@/components/project-detail/components/FilesPanel";
import { CommentsPanel } from "@/components/project-detail/components/CommentsPanel";
import { MeetingsPanel } from "@/components/project-detail/components/MeetingsPanel";
import { NotesPanel } from "@/components/project-detail/components/NotesPanel";
import { PaymentsPanel } from "@/components/project-detail/components/PaymentsPanel";
import { ActivityPanel } from "@/components/project-detail/components/ActivityPanel";

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
  // ── Tab state
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  // ── Milestone state
  const initialSlice =
    projectId === "2"
      ? milestones.slice(0, 3)
      : projectId === "3"
        ? milestones
        : milestones.slice(0, 5);

  const [milestoneState, setMilestoneState] = useState<Milestone[]>(() =>
    initialSlice.map((m) => ({ ...m, tasks: [...m.tasks] })),
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

  // ── Derived
  const completedMilestones = useMemo(
    () => milestoneState.filter((m) => m.status === "completed"),
    [milestoneState],
  );
  const nextMilestone =
    milestoneState.find((m) => m.status !== "completed") ?? milestoneState[0];

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
    setMsTitle(ms?.title ?? "");
    setMsDescription(ms?.description ?? "");
    setMsDueDate(ms?.dueDate ?? "");
    setMsAmount(ms?.amount ?? "");
    setMsStatus(ms?.status ?? "pending");
    setMilestoneModalOpen(true);
  };

  const handleMilestoneSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const title = msTitle.trim();
    const dueDate = msDueDate.trim();
    const amount = msAmount.trim();
    if (!title || !dueDate || !amount) return;
    if (milestoneModalMode === "edit" && milestoneModalEditingId) {
      setMilestoneState((prev) =>
        prev.map((m) =>
          m.id === milestoneModalEditingId
            ? {
                ...m,
                title,
                description: msDescription.trim(),
                dueDate,
                amount,
                status: msStatus,
              }
            : m,
        ),
      );
    } else {
      setMilestoneState((prev) => [
        ...prev,
        {
          id: `ms-${Date.now()}`,
          title,
          description: msDescription.trim(),
          dueDate,
          amount,
          status: msStatus,
          tasks: [],
        },
      ]);
    }
    setMilestoneModalOpen(false);
    setMilestoneModalEditingId(null);
  };

  const handleMilestoneStatusChange = (
    milestoneId: string,
    status: MilestoneStatus,
  ) => {
    setMilestoneState((prev) =>
      prev.map((m) => (m.id === milestoneId ? { ...m, status } : m)),
    );
    setOpenStatusDropdown(null);
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
  };

  // ─────────────────────────────────────── Render ──

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">

      {/* ── Project Header ─────────────────────────────── */}
      <header className="space-y-3 border-b border-border pb-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-3xl font-semibold text-foreground">
            {projectSummary.title}
          </h1>
          <StatusBadge status={projectSummary.status} />
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
      <MilestoneStepTracker milestoneItems={milestoneState} />

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
          milestones={milestoneState}
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
        />
      ) : null}

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
