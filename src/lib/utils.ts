export function formatTime(secs: number): string {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function getAudioExtension(mimeType: string): string {
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("aac")) return "aac";
  return "webm";
}

export function getEvidenceFilename(mimeType: string): string {
  const ext = getAudioExtension(mimeType);
  const now = new Date();
  const date = now.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "");
  const time = now.toTimeString().slice(0, 5).replace(":", "");
  return `遇袭取证_${date}_${time}.${ext}`;
}
