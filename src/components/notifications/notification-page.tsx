"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCircle2, MessageSquareText, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationCard } from "@/components/notifications/NotificationCard";

type NotificationType = "payment" | "message" | "system";

type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  href?: string;
  isRead: boolean;
};

const initialNotifications: NotificationItem[] = [
  {
    id: "n-1",
    type: "payment",
    title: "Milestone payment completed",
    description: "Dashboard UX and UI System was marked as paid.",
    timestamp: "2h ago",
    href: "/payments",
    isRead: false,
  },
  {
    id: "n-2",
    type: "message",
    title: "New client comment",
    description: "Noah Carter commented on Web App Redesign.",
    timestamp: "5h ago",
    href: "/projects/1",
    isRead: false,
  },
  {
    id: "n-3",
    type: "system",
    title: "Profile reminder",
    description: "Keep your profile details updated for invoice compliance.",
    timestamp: "Yesterday",
    isRead: true,
  },
];

function getNotificationIcon(type: NotificationType) {
  if (type === "payment") return Wallet;
  if (type === "message") return MessageSquareText;
  return Bell;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  );

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const onNotificationClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)),
    );

    if (item.href) router.push(item.href);
  };

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Notifications
        </h1>
        <p className="text-sm text-muted-foreground">
          Stay on top of updates, comments, and payment events.
        </p>
      </header>

      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
        <p className="text-sm text-muted-foreground">
          {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
        </p>
        <Button
          type="button"
          variant="outline"
          className="h-9"
          onClick={markAllAsRead}
        >
          <CheckCircle2 className="mr-1.5 h-4 w-4" />
          Mark all as read
        </Button>
      </div>

      <section className="space-y-3">
        {notifications.map((item) => {
          const Icon = getNotificationIcon(item.type);
          return (
            <NotificationCard
              key={item.id}
              icon={Icon}
              title={item.title}
              description={item.description}
              timestamp={item.timestamp}
              isRead={item.isRead}
              onClick={() => onNotificationClick(item)}
            />
          );
        })}
      </section>
    </div>
  );
}
