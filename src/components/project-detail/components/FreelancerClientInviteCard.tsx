"use client";

import { ClientEmailLookupField } from "@/components/project-detail/components/ClientEmailLookupField";
import { Button } from "@/components/ui/button";
import type { UserRead } from "@/lib/apis/auth/schema";

export type FreelancerClientInviteCardMode = "assign" | "invite";

export type FreelancerClientInviteCardProps = {
  mode: FreelancerClientInviteCardMode;
  description: string;
  lookupLabel: string;
  lookupHint?: string;
  resetKey: number | string;
  lookupDisabled?: boolean;
  selectedClient: UserRead | null;
  onSelectedClientChange: (client: UserRead | null) => void;
  /** When `mode` is `invite`, show the copy-invite-link block (edit project only). */
  showCopyInviteLink?: boolean;
  onSendInvite?: () => void;
  onCopyInviteLink?: () => void;
  inviteBusy?: boolean;
};

export function FreelancerClientInviteCard({
  mode,
  description,
  lookupLabel,
  lookupHint,
  resetKey,
  lookupDisabled,
  selectedClient,
  onSelectedClientChange,
  showCopyInviteLink = false,
  onSendInvite,
  onCopyInviteLink,
  inviteBusy = false,
}: FreelancerClientInviteCardProps) {
  const busy = Boolean(inviteBusy);

  return (
    <div className="md:col-span-2 space-y-3 rounded-lg border border-border bg-muted/20 p-4">
      <p className="text-sm font-semibold text-foreground">Client</p>
      <p className="text-xs text-muted-foreground">{description}</p>

      <ClientEmailLookupField
        label={lookupLabel}
        labelWide={mode === "assign"}
        hint={lookupHint}
        resetKey={resetKey}
        disabled={lookupDisabled}
        selectedClient={selectedClient}
        onSelectedClientChange={onSelectedClientChange}
      />

      {mode === "assign" && selectedClient ? (
        <p className="text-xs text-muted-foreground">
          Assigned client:{" "}
          <span className="font-medium text-foreground">{selectedClient.name}</span>{" "}
          ({selectedClient.email}, ID {selectedClient.id})
        </p>
      ) : null}

      {mode === "invite" && selectedClient ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Selected for invite</p>
            <p className="font-medium text-foreground">{selectedClient.name}</p>
            <p className="text-xs text-muted-foreground">{selectedClient.email}</p>
          </div>
          <Button
            type="button"
            size="sm"
            disabled={busy || !onSendInvite}
            onClick={() => onSendInvite?.()}
          >
            Send invite
          </Button>
        </div>
      ) : null}

      {mode === "invite" && showCopyInviteLink ? (
        <div className="border-t border-border pt-3">
          <Button
            type="button"
            variant="outline"
            className="h-9"
            disabled={busy || !onCopyInviteLink}
            onClick={() => onCopyInviteLink?.()}
          >
            Copy invite link
          </Button>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            Single-use link (7 days). Opens join flow; client must log in or sign up.
          </p>
        </div>
      ) : null}
    </div>
  );
}
