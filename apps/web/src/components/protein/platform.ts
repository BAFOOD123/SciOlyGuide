/**
 * How the studio hands files to the student. In the Next app this is a plain
 * browser download / print window; the standalone build (demo/protein) swaps
 * this module for one that goes through the hosting page's download prompt.
 * Each function resolves to a short message to show, or null.
 */

/** Offer a generated file (JSON design, PNG image). */
export async function offerFile(filename: string, data: string | Blob): Promise<string | null> {
  const blob = typeof data === "string" ? new Blob([data], { type: "application/octet-stream" }) : data;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  return null;
}

/** Open a printable document (legend, build sheet). `html` is a complete document. */
export async function offerPrintable(_filename: string, html: string): Promise<string | null> {
  const w = window.open("", "_blank");
  if (!w) return "Allow pop-ups for this site to print.";
  w.document.write(html);
  w.document.close();
  return null;
}

/** Whether printing opens a print window (true) or saves an HTML file to print (false). */
export const PRINTS_DIRECTLY = true;
