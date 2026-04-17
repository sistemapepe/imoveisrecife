/**
 * Convert an array of objects to a CSV string and trigger a browser download.
 * Values are escaped to prevent CSV injection (formula prefixes) and proper quoting.
 */
export function downloadCSV<T>(
  rows: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[],
) {
  if (!rows.length) {
    const blob = new Blob(["\uFEFF"], { type: "text/csv;charset=utf-8;" });
    triggerDownload(blob, filename);
    return;
  }

  const cols =
    columns ??
    (Object.keys(rows[0]) as (keyof T)[]).map((k) => ({ key: k, label: String(k) }));

  const escape = (val: unknown): string => {
    if (val === null || val === undefined) return "";
    let s = typeof val === "string" ? val : JSON.stringify(val);
    // Prevent CSV/Excel formula injection
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    if (/[",\n\r;]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const header = cols.map((c) => escape(c.label)).join(",");
  const body = rows
    .map((row) => cols.map((c) => escape(row[c.key])).join(","))
    .join("\n");

  // BOM for Excel UTF-8 compatibility
  const csv = "\uFEFF" + header + "\n" + body;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, filename);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
