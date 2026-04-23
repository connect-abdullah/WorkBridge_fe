"use client";

import { FormEvent } from "react";
import {
  ArrowLeft,
  ExternalLink,
  MessagesSquare,
  Pencil,
  Plus,
} from "lucide-react";
import { type Meeting } from "@/constants/project-detail";
import { Button } from "@/components/ui/button";
import { Modal } from "./Modal";
import { FormField, inputCls } from "@/components/ui/form-field";

export function MeetingsPanel({
  meetings,
  meetingNotesId,
  setMeetingNotesId,
  onMeetingNotesChange,
  meetingFormOpen,
  meetingFormMode,
  onOpenMeetingForm,
  onCloseMeetingForm,
  mtTitle,
  setMtTitle,
  mtLink,
  setMtLink,
  mtDateTime,
  setMtDateTime,
  mtDescription,
  setMtDescription,
  onMeetingSubmit,
}: {
  meetings: Meeting[];
  meetingNotesId: string | null;
  setMeetingNotesId: (id: string | null) => void;
  onMeetingNotesChange: (
    id: string,
    field: "privateNotes" | "sharedNotes",
    value: string,
  ) => void;
  meetingFormOpen: boolean;
  meetingFormMode: "create" | "edit";
  onOpenMeetingForm: (mode: "create" | "edit", meeting?: Meeting) => void;
  onCloseMeetingForm: () => void;
  mtTitle: string;
  setMtTitle: (v: string) => void;
  mtLink: string;
  setMtLink: (v: string) => void;
  mtDateTime: string;
  setMtDateTime: (v: string) => void;
  mtDescription: string;
  setMtDescription: (v: string) => void;
  onMeetingSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) {
  const selectedMeeting = meetings.find((m) => m.id === meetingNotesId) ?? null;

  return (
    <section className="space-y-4">
      {selectedMeeting ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMeetingNotesId(null)}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-primary transition hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Meetings
            </button>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground">
              {selectedMeeting.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedMeeting.dateTime}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
              <div>
                <h4 className="font-semibold text-foreground">Private Notes</h4>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Only visible to you
                </p>
              </div>
              <textarea
                value={selectedMeeting.privateNotes}
                onChange={(e) =>
                  onMeetingNotesChange(
                    selectedMeeting.id,
                    "privateNotes",
                    e.target.value,
                  )
                }
                className="h-44 w-full resize-none rounded-md border border-input bg-background p-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Your private notes for this meeting…"
              />
              <Button type="button" className="h-9">
                Save Private Notes
              </Button>
            </article>

            <article className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
              <div>
                <h4 className="font-semibold text-foreground">Shared Notes</h4>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Visible to all project members
                </p>
              </div>
              <textarea
                value={selectedMeeting.sharedNotes}
                onChange={(e) =>
                  onMeetingNotesChange(
                    selectedMeeting.id,
                    "sharedNotes",
                    e.target.value,
                  )
                }
                className="h-44 w-full resize-none rounded-md border border-input bg-background p-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Shared notes from this meeting…"
              />
              <Button type="button" className="h-9">
                Save Shared Notes
              </Button>
            </article>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">Meetings</h2>
            <Button
              className="h-10"
              onClick={() => onOpenMeetingForm("create")}
            >
              <Plus className="mr-1.5 h-4 w-4" /> Create Meeting
            </Button>
          </div>

          <div className="space-y-3">
            {meetings.map((meeting) => (
              <article
                key={meeting.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground">
                    {meeting.title}
                  </h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {meeting.dateTime}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {meeting.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMeetingNotesId(meeting.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    aria-label="View meeting notes"
                    title="View Notes"
                  >
                    <MessagesSquare className="h-4 w-4" />
                  </button>

                  <a
                    href={meeting.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    aria-label="Go to meeting"
                    title="Go to Meeting"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() => onOpenMeetingForm("edit", meeting)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    aria-label="Edit meeting"
                    title="Edit Meeting"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      <Modal
        open={meetingFormOpen}
        onClose={onCloseMeetingForm}
        title={meetingFormMode === "create" ? "Create Meeting" : "Edit Meeting"}
        subtitle="Schedule and track collaboration sessions with your client."
      >
        <form onSubmit={onMeetingSubmit} className="grid gap-4 md:grid-cols-2">
          <FormField label="Meeting Title" wide>
            <input
              value={mtTitle}
              onChange={(e) => setMtTitle(e.target.value)}
              placeholder="e.g. Weekly Project Sync"
              className={inputCls}
            />
          </FormField>

          <FormField label="Meeting Link" wide>
            <input
              value={mtLink}
              onChange={(e) => setMtLink(e.target.value)}
              placeholder="https://meet.example.com/..."
              className={inputCls}
            />
          </FormField>

          <FormField label="Date & Time">
            <input
              value={mtDateTime}
              onChange={(e) => setMtDateTime(e.target.value)}
              placeholder="Apr 06, 2026 – 3:00 PM"
              className={inputCls}
            />
          </FormField>

          <FormField label="Description">
            <input
              value={mtDescription}
              onChange={(e) => setMtDescription(e.target.value)}
              placeholder="Brief agenda or topic"
              className={inputCls}
            />
          </FormField>

          <div className="md:col-span-2 flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={onCloseMeetingForm}
            >
              Cancel
            </Button>
            <Button type="submit" className="h-10">
              {meetingFormMode === "create" ? "Create Meeting" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
