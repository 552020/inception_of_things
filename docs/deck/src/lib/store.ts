// Server side: one JSON file per user in the private Blob store.
import { get, put } from "@vercel/blob";

export type StoredProgress = Record<string, unknown>;

function pathOf(user: string) {
  return `progress/${user}.json`;
}

export async function readProgress(user: string): Promise<StoredProgress> {
  const result = await get(pathOf(user), { access: "private", useCache: false });
  if (!result) return {};
  const text = await new Response(result.stream).text();
  try {
    return JSON.parse(text) as StoredProgress;
  } catch {
    return {};
  }
}

export async function writeProgress(user: string, progress: StoredProgress): Promise<void> {
  await put(pathOf(user), JSON.stringify(progress), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}
