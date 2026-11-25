/**
 * Standalone stand-in for src/components/protein/platform.ts. The hosting page
 * can't print or start downloads itself, so files go through its download prompt.
 */
import { use } from "./host";

interface Downloads {
  save(req: { filename: string; data: string | Blob }): Promise<{ status: string }>;
}

export const PRINTS_DIRECTLY = false;

export async function offerFile(filename: string, data: string | Blob): Promise<string | null> {
  const downloads = await use<Downloads>("downloads");
  if (!downloads) return "Saving files isn’t available in this view. Open the page on claude.ai in a browser to save files.";
  try {
    await downloads.save({ filename, data });
    return `Saved ${filename}.`;
  } catch (e) {
    const code = (e as { code?: string })?.code;
    if (code === "declined") return null;
    if (code === "rate_limited") return "A save is already waiting for you to confirm. Try again in a moment.";
    if (code === "host_unavailable") return "This app can’t save files. Open the page in a browser or on a computer.";
    return "Couldn’t save the file here.";
  }
}

export async function offerPrintable(filename: string, html: string): Promise<string | null> {
  const msg = await offerFile(filename, html);
  return msg?.startsWith("Saved ") ? `Saved ${filename}. Open it in your browser and it brings up the print dialog.` : msg;
}
