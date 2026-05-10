import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Define a more accurate TypeScript type for responses if needed
type SupabaseUploadResult = {
  path?: string;
  fullPath?: string;
  Key?: string;
};

function normalizeStoragePath(bucket: string, keyOrPath: string): string {
  const v = (keyOrPath || "").replace(/^\/+/, "");
  // Supabase sometimes returns "Bucket/path..." as Key; getPublicUrl expects "path..."
  if (v.startsWith(`${bucket}/`)) return v.slice(bucket.length + 1);
  return v;
}

/**
 * Storage object names must not contain raw spaces, `#`, `?`, slashes, or odd Unicode
 * (common in macOS screenshots). Original `File.name` is still sent to your API for display.
 */
function sanitizeStorageFileName(name: string): string {
  const base = (name || "file").replace(/\\/g, "/").split("/").pop() || "file";
  const normalized = base.normalize("NFKC").replace(/\s+/g, "-");
  const extMatch = normalized.match(/(\.[a-zA-Z0-9]{1,10})$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : "";
  const stem = ext ? normalized.slice(0, -ext.length) : normalized;
  const safeStem = stem
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
  const safeExt = ext.replace(/[^.a-z0-9]/g, "");
  return `${safeStem || "upload"}${safeExt || ""}`;
}

/**
 * Uploads the selected file to Supabase and returns a public URL. The
 * `userId` is used purely as a path prefix in the storage bucket so each
 * user's uploads stay isolated; pass the current session user's id from
 * `useSessionUser()`. Supabase does not enforce auth on this bucket — the
 * authoritative auth check happens on the FastAPI endpoint that consumes
 * the returned URL.
 */
export const handleUpload = async (
  input: React.ChangeEvent<HTMLInputElement> | File,
  userId: number | string,
): Promise<string> => {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
    );
  }

  const file =
    input instanceof File ? input : (input.target.files && input.target.files[0]);
  if (!file) throw new Error("No file selected.");

  if (userId == null || userId === "" || userId === 0) {
    throw new Error("User ID not found.");
  }

  const safeName = sanitizeStorageFileName(file.name);
  const filePath = `${userId}/${Date.now()}-${safeName}`;

  // Upload the file
  const { data: uploadData, error } = await supabase.storage
    .from("WorkBridge")
    .upload(filePath, file,{
      cacheControl: '3600', // 1 hour
      upsert: false, // Don't overwrite existing files,
      contentType: file.type,
    });

  if (error) throw new Error(error.message);

  const rawPath: string | undefined =
    // supabase-js
    (uploadData as SupabaseUploadResult | null)?.path ??
    // storage REST response sometimes includes Key
    (uploadData as SupabaseUploadResult | null)?.Key;

  if (!rawPath) {
    throw new Error("File upload did not return a path.");
  }

  // Get the public URL
  const { data: {publicUrl} } = supabase.storage
    .from("WorkBridge")
    .getPublicUrl(normalizeStoragePath("WorkBridge", rawPath));

  if (!publicUrl) {
    throw new Error("Failed to get public URL for uploaded file.");
  }

  return publicUrl;
};