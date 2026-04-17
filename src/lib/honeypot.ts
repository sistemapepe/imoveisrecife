/**
 * Anti-bot helpers: invisible honeypot field + time-trap.
 * Bots typically auto-fill all fields and submit instantly;
 * humans skip hidden fields and take >2s to fill a form.
 */

export const HONEYPOT_FIELD_NAME = "website";
export const MIN_FORM_FILL_MS = 2000;

export interface HoneypotCheckResult {
  ok: boolean;
  reason?: "honeypot" | "too_fast";
}

export function checkHoneypot(
  honeypotValue: string,
  formOpenedAt: number
): HoneypotCheckResult {
  if (honeypotValue && honeypotValue.trim().length > 0) {
    return { ok: false, reason: "honeypot" };
  }
  if (Date.now() - formOpenedAt < MIN_FORM_FILL_MS) {
    return { ok: false, reason: "too_fast" };
  }
  return { ok: true };
}

/** Inline style for the honeypot input — hidden from humans, visible to bots. */
export const honeypotInputStyle: React.CSSProperties = {
  position: "absolute",
  left: "-9999px",
  width: "1px",
  height: "1px",
  opacity: 0,
  pointerEvents: "none",
};
