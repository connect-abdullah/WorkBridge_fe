"use client";

import { FormEvent } from "react";
import { type CommentMessage } from "@/constants/project-detail";
import { Button } from "@/components/ui/button";

export function CommentsPanel({
  comments,
  commentDraft,
  setCommentDraft,
  onSend,
}: {
  comments: CommentMessage[];
  commentDraft: string;
  setCommentDraft: (v: string) => void;
  onSend: (e: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex h-[440px] flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {comments.map((item) => (
            <div
              key={item.id}
              className={`flex ${
                item.role === "freelancer" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[72%] rounded-2xl px-4 py-2.5 text-sm ${
                  item.role === "freelancer"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p>{item.message}</p>
                <p className="mt-1 text-[11px] opacity-70">{item.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={onSend} className="border-t border-border p-3">
          <div className="flex gap-2">
            <input
              value={commentDraft}
              onChange={(e) => setCommentDraft(e.target.value)}
              placeholder="Write a comment…"
              className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <Button type="submit" className="h-10">
              Send
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
