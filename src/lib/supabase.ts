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

// Uploads the selected file to Supabase and returns a public URL.
export const handleUpload = async (
  input: React.ChangeEvent<HTMLInputElement> | File,
): Promise<string> => {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
    );
  }

  const file =
    input instanceof File ? input : (input.target.files && input.target.files[0]);
  if (!file) throw new Error("No file selected.");

  // Parse user from localStorage (assuming a JSON string in 'auth:user')
  const userStr = localStorage.getItem("auth:user");
  if (!userStr) throw new Error("User is not authenticated.");
  let userId: string | undefined;
  try {
    const userObj = JSON.parse(userStr);
    userId = userObj?.id;
  } catch {
    throw new Error("Invalid user data in localStorage.");
  }
  if (!userId) throw new Error("User ID not found.");

  // Create a unique file path
  const filePath = `${userId}/${Date.now()}-${file.name}`;

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