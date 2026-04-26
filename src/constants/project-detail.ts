export type ProjectStatus = "pending" | "in-progress" | "completed";
export type MilestoneStatus = "pending" | "in-progress" | "completed";
export type MilestoneApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "revision-requested";
export type PaymentStatus = "pending" | "in-progress" | "completed" | "paid";
export type MessageRole = "freelancer" | "client";

export type ProjectSummary = {
  id: string;
  title: string;
  status: ProjectStatus;
  description: string;
  startDate: string;
  endDate: string;
  paidAmount: string;
  totalAmount: string;
};

export type Milestone = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  dueDateIso: string;
  amount: string;
  status: MilestoneStatus;
  approvalStatus?: MilestoneApprovalStatus;
  tasks: TaskItem[];
};

export type TaskItem = {
  id: string;
  title: string;
  description: string;
};

export type ProjectFile = {
  id: string;
  fileName: string;
  fileType: string;
  uploadedDate: string;
  uploadedBy: string;
};

export type CommentMessage = {
  id: string;
  role: MessageRole;
  message: string;
  timestamp: string;
};

export type Meeting = {
  id: string;
  title: string;
  link: string;
  dateTime: string;
  description: string;
  privateNotes: string;
  sharedNotes: string;
};

export type PaymentRow = {
  id: string;
  milestone: string;
  amount: string;
  status: PaymentStatus;
};

export type ActivityLog = {
  id: string;
  action: string;
  timestamp: string;
  icon: "check" | "message" | "file" | "calendar";
};

export const projectSummary: ProjectSummary = {
  id: "proj-001",
  title: "Web App Redesign",
  status: "in-progress",
  description:
    "End-to-end redesign of the client portal with improved usability, milestone visibility, and better collaboration workflows.",
  startDate: "Mar 01, 2026",
  endDate: "Apr 30, 2026",
  paidAmount: "$3,600",
  totalAmount: "$4,500",
};

export const milestones: Milestone[] = [
  {
    id: "ms-1",
    title: "Discovery and Scope Alignment",
    description: "Clarify requirements, priorities, and handoff expectations.",
    dueDate: "Mar 08, 2026",
    dueDateIso: "2026-03-08T00:00:00Z",
    amount: "$900",
    status: "completed",
    tasks: [
      {
        id: "t-1",
        title: "Requirement workshop",
        description:
          "Run a stakeholder session to capture constraints and goals.",
      },
      {
        id: "t-2",
        title: "User flow mapping",
        description: "Map key flows and identify friction points to fix.",
      },
      {
        id: "t-3",
        title: "Scope sign-off",
        description: "Finalize deliverables and confirm timeline expectations.",
      },
    ],
  },
  {
    id: "ms-2",
    title: "Dashboard UX and UI System",
    description: "Design scalable dashboard layout and reusable components.",
    dueDate: "Mar 24, 2026",
    dueDateIso: "2026-03-24T00:00:00Z",
    amount: "$1,300",
    status: "in-progress",
    tasks: [
      {
        id: "t-4",
        title: "Layout system",
        description: "Define the grid, spacing scale, and page scaffolding.",
      },
      {
        id: "t-5",
        title: "Card components",
        description: "Build reusable cards for stats, lists, and summaries.",
      },
      {
        id: "t-6",
        title: "Responsive refinements",
        description: "Polish layouts for tablet/mobile breakpoints.",
      },
    ],
  },
  {
    id: "ms-3",
    title: "Implementation and QA",
    description: "Build, polish, and verify project detail interactions.",
    dueDate: "Apr 12, 2026",
    dueDateIso: "2026-04-12T00:00:00Z",
    amount: "$1,200",
    status: "pending",
    tasks: [],
  },
  {
    id: "ms-4",
    title: "Final Handoff",
    description: "Final demo, documentation, and delivery support.",
    dueDate: "Apr 30, 2026",
    dueDateIso: "2026-04-30T00:00:00Z",
    amount: "$1,100",
    status: "pending",
    tasks: [],
  },
];

export const projectFiles: ProjectFile[] = [
  {
    id: "f-1",
    fileName: "wireframes-v2.fig",
    fileType: "Figma",
    uploadedDate: "Apr 01, 2026",
    uploadedBy: "Aisha Johnson",
  },
  {
    id: "f-2",
    fileName: "scope-alignment-notes.pdf",
    fileType: "PDF",
    uploadedDate: "Mar 28, 2026",
    uploadedBy: "Noah Carter",
  },
  {
    id: "f-3",
    fileName: "ui-components-checklist.xlsx",
    fileType: "Spreadsheet",
    uploadedDate: "Mar 26, 2026",
    uploadedBy: "Aisha Johnson",
  },
];

export const initialComments: CommentMessage[] = [
  {
    id: "c-1",
    role: "client",
    message: "Can we prioritize the milestone tracker in this sprint?",
    timestamp: "10:20 AM",
  },
  {
    id: "c-2",
    role: "freelancer",
    message: "Yes, I moved it into the current milestone and shared updates.",
    timestamp: "10:33 AM",
  },
  {
    id: "c-3",
    role: "client",
    message: "Perfect. Please keep the file naming consistent for handoff.",
    timestamp: "11:02 AM",
  },
];

export const initialMeetings: Meeting[] = [
  {
    id: "m-1",
    title: "Weekly Project Sync",
    link: "https://meet.example.com/workbridge-sync",
    dateTime: "Apr 06, 2026 - 3:00 PM",
    description: "Review milestone progress and feedback points.",
    privateNotes: "Need to confirm timeline risk around implementation QA.",
    sharedNotes: "Client approved tracker direction and asked for clean tabs.",
  },
  {
    id: "m-2",
    title: "Design Review Session",
    link: "https://meet.example.com/workbridge-design",
    dateTime: "Apr 10, 2026 - 11:30 AM",
    description: "Walk through final layout details and interaction states.",
    privateNotes: "Prepare component audit before the meeting.",
    sharedNotes: "Discussed accessibility and spacing consistency updates.",
  },
];

export const paymentRows: PaymentRow[] = [
  {
    id: "p-1",
    milestone: "Discovery and Scope Alignment",
    amount: "$900",
    status: "completed",
  },
  {
    id: "p-2",
    milestone: "Dashboard UX and UI System",
    amount: "$1,300",
    status: "in-progress",
  },
  {
    id: "p-3",
    milestone: "Implementation and QA",
    amount: "$1,200",
    status: "pending",
  },
];

export const activityLogs: ActivityLog[] = [
  {
    id: "a-1",
    action: "Milestone 'Discovery and Scope Alignment' marked completed.",
    timestamp: "Today, 9:18 AM",
    icon: "check",
  },
  {
    id: "a-2",
    action: "Client commented on project detail structure.",
    timestamp: "Today, 8:43 AM",
    icon: "message",
  },
  {
    id: "a-3",
    action: "Uploaded file: wireframes-v2.fig",
    timestamp: "Yesterday, 5:04 PM",
    icon: "file",
  },
  {
    id: "a-4",
    action: "Meeting created: Weekly Project Sync",
    timestamp: "Yesterday, 2:31 PM",
    icon: "calendar",
  },
];
