import { post } from "@/lib/https";
import { APIResponse } from "@/lib/apis/apiResponse";
import type { WaitlistCreate, WaitlistRead } from "@/lib/apis/waitlist/schema";

const ENDPOINT = "/waitlists";

type WaitlistCreateResponse = APIResponse<WaitlistRead> | WaitlistRead;

function unwrapWaitlistResponse(res: WaitlistCreateResponse): WaitlistRead {
  if (typeof res === "object" && res && "success" in res) {
    const api = res as APIResponse<WaitlistRead>;
    if (!api.success) {
      throw new Error(api.message || "Failed to join waitlist.");
    }
    if (!api.data) {
      throw new Error("Waitlist response missing data.");
    }
    return api.data;
  }
  return res as WaitlistRead;
}

export const waitlistService = {
  create: async (data: WaitlistCreate) => {
    const res = await post<WaitlistCreateResponse, WaitlistCreate>(ENDPOINT, data);
    return unwrapWaitlistResponse(res);
  },
};

