/**
 * Utility to fetch media from Google Cloud APIs that require authentication headers.
 */
export async function fetchCloudMedia(uri: string): Promise<string> {
  const currentApiKey = (process as any).env.API_KEY || (process as any).env.GEMINI_API_KEY;
  
  if (!currentApiKey) {
    throw new Error("Missing API key for cloud media access.");
  }

  const response = await fetch(uri, {
    headers: {
      'x-goog-api-key': currentApiKey
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch cloud media: ${response.statusText}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export function isCloudUri(uri: string): boolean {
  return uri.includes('generativelanguage.googleapis.com');
}
