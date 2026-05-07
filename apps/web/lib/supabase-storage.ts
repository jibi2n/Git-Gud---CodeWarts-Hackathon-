import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export async function uploadToSupabaseStorage(options: {
  bucket: string;
  path: string;
  file: Blob;
  contentType: string;
  cacheControl?: string;
}) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("supabase_not_configured");
  }

  const { error: uploadError } = await supabase.storage
    .from(options.bucket)
    .upload(options.path, options.file, {
      contentType: options.contentType,
      upsert: true,
      cacheControl: options.cacheControl ?? "3600",
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data, error: signedError } = await supabase.storage
    .from(options.bucket)
    .createSignedUrl(options.path, 60 * 60);

  if (signedError || !data?.signedUrl) {
    throw new Error(signedError?.message ?? "signed_url_failed");
  }

  return data.signedUrl;
}

