/**
 * Maps API-provided activity names (e.g. "Task Created") to user-facing sentences.
 *
 * Keep keys aligned to backend activity `message` / `name` values.
 */
export const ACTIVITY_SENTENCE_BY_NAME = {
  // messages
  "Message Created": "A new message was created.",

  // files
  "File Uploaded": "A file was uploaded.",
  "File Updated": "A file was updated.",
  "File Deleted": "A file was deleted.",

  // meetings
  "Meeting Created": "A meeting was created.",
  "Meeting Updated": "A meeting was updated.",
  "Meeting Deleted": "A meeting was deleted.",

  // milestones
  "Milestone Created": "A milestone was created.",
  "Milestone Updated": "A milestone was updated.",
  "Milestone Deleted": "A milestone was deleted.",

  // notes
  "Shared Note Updated": "A shared note was updated.",

  // payments
  "Payment Created": "A payment was created.",
  "Payment Updated": "A payment was updated.",
  "Payment Deleted": "A payment was deleted.",
  "Payment Paid": "A payment was marked as paid.",
  "Payment Requested": "A payment was requested.",
  "Payment Submitted": "A payment was submitted.",
  "Payment Disputed": "The client disputed the payment.",
  "Payment Failed — Awaiting New Submission":
    "Payment failed — awaiting a new submission.",

  // projects
  "Project Created": "A project was created.",
  "Project Updated": "A project was updated.",
  "Project Deleted": "A project was deleted.",

  // tasks
  "Task Created": "A task was created.",
  "Task Updated": "A task was updated.",
  "Task Deleted": "A task was deleted.",
} as const satisfies Record<string, string>;

export function getActivitySentence(activityName: string): string {
  return (
    ACTIVITY_SENTENCE_BY_NAME[
      activityName as keyof typeof ACTIVITY_SENTENCE_BY_NAME
    ] ?? activityName
  );
}

