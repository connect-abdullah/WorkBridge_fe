import {
  Activity,
  CheckCircle2,
  CircleDashed,
  ClipboardList,
  Clock4,
  Coins,
  FolderKanban,
  ListChecks,
  ReceiptText,
  Wallet,
} from "lucide-react";

export const dashboardStats = [
  {
    title: "Active Projects",
    value: "8",
    hint: "2 new this week",
    icon: FolderKanban,
  },
  {
    title: "Total Earnings",
    value: "$12,480",
    hint: "+14% from last month",
    icon: Wallet,
  },
  {
    title: "Pending Approvals",
    value: "3",
    hint: "Awaiting client feedback",
    icon: Clock4,
  },
  {
    title: "Completed Projects",
    value: "26",
    hint: "4 delivered this quarter",
    icon: CheckCircle2,
  },
] as const;

/** Static demo metrics for the client dashboard (no API). */
export const clientDashboardStats = [
  {
    title: "Total Spend",
    value: "$48,200",
    hint: "Lifetime on WorkBridge",
    icon: Wallet,
  },
  {
    title: "Active Projects",
    value: "5",
    hint: "Across your projects",
    icon: FolderKanban,
  },
  {
    title: "Milestones to approve",
    value: "2",
    hint: "Your review unlocks the next phase",
    icon: ListChecks,
  },
  {
    title: "Pending Payments",
    value: "12",
    hint: "Payments to pay out",
    icon: CheckCircle2,
  },
] as const;

export const dashboardProjects = [
  {
    title: "Web App Redesign",
    clientName: "Northwind Labs",
    progress: 72,
    milestoneTitle: "Responsive dashboard handoff",
    milestoneDueDate: "Apr 08",
    milestoneStatus: "in-progress" as const,
    projectDueDate: "Apr 30, 2026",
    amount: "$4,500",
  },
  {
    title: "Marketing Site Revamp",
    clientName: "Bluepeak Digital",
    progress: 41,
    milestoneTitle: "Copy + UI alignment review",
    milestoneDueDate: "Apr 12",
    milestoneStatus: "pending" as const,
    projectDueDate: "May 10, 2026",
    amount: "$3,200",
  },
  {
    title: "Subscription Billing Portal",
    clientName: "Briar & Co.",
    progress: 88,
    milestoneTitle: "Final QA and deployment prep",
    milestoneDueDate: "Apr 06",
    milestoneStatus: "completed" as const,
    projectDueDate: "Apr 15, 2026",
    amount: "$6,800",
  },
] as const;

/** Demo project rows for client dashboard — `clientName` holds freelancer display name (see ProjectCard `partnerKind`). */
export const clientDashboardProjects = [
  {
    title: "Web App Redesign",
    clientName: "Jordan Lee",
    progress: 72,
    milestoneTitle: "Responsive dashboard handoff",
    milestoneDueDate: "Apr 08",
    milestoneStatus: "in-progress" as const,
    projectDueDate: "Apr 30, 2026",
    amount: "$4,500",
  },
  {
    title: "Marketing Site Revamp",
    clientName: "Samira Khan",
    progress: 41,
    milestoneTitle: "Copy + UI alignment review",
    milestoneDueDate: "Apr 12",
    milestoneStatus: "pending" as const,
    projectDueDate: "May 10, 2026",
    amount: "$3,200",
  },
  {
    title: "Subscription Billing Portal",
    clientName: "Chris Okonkwo",
    progress: 88,
    milestoneTitle: "Final QA and deployment prep",
    milestoneDueDate: "Apr 06",
    milestoneStatus: "completed" as const,
    projectDueDate: "Apr 15, 2026",
    amount: "$6,800",
  },
] as const;

export const dashboardActivities = [
  {
    id: "1",
    icon: CheckCircle2,
    message: "Client approved milestone: Landing page refinement.",
    timestamp: "10 minutes ago",
  },
  {
    id: "2",
    icon: ReceiptText,
    message: "Invoice #WB-2026-041 marked as paid.",
    timestamp: "1 hour ago",
  },
  {
    id: "3",
    icon: CircleDashed,
    message: "Milestone submitted for review on Web App Redesign.",
    timestamp: "3 hours ago",
  },
  {
    id: "4",
    icon: Coins,
    message: "Escrow released for Sprint 3 delivery.",
    timestamp: "Yesterday, 5:42 PM",
  },
  {
    id: "5",
    icon: Activity,
    message: "Client added feedback on Billing Portal wireframes.",
    timestamp: "Yesterday, 1:18 PM",
  },
] as const;

export const clientDashboardActivities = [
  {
    id: "c1",
    icon: CheckCircle2,
    message: "You approved the milestone: Landing page refinement.",
    timestamp: "10 minutes ago",
  },
  {
    id: "c2",
    icon: ReceiptText,
    message: "Payment submitted for Sprint 2 — awaiting freelancer confirmation.",
    timestamp: "1 hour ago",
  },
  {
    id: "c3",
    icon: ClipboardList,
    message: 'Milestone "API integration" is ready for your review.',
    timestamp: "3 hours ago",
  },
  {
    id: "c4",
    icon: Coins,
    message: "Escrow released after you approved the Brand Kit delivery.",
    timestamp: "Yesterday, 5:42 PM",
  },
  {
    id: "c5",
    icon: Activity,
    message: "Jordan Lee left a message on Web App Redesign.",
    timestamp: "Yesterday, 1:18 PM",
  },
] as const;
