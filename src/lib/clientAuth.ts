export type AccessRole = "admin" | "partner" | "consultant";

/**
 * Asks the server to check an access code. The browser never holds or compares secrets;
 * it only learns the role the server resolved (or null if the code was not accepted).
 */
export async function verifyAccessCode(code: string): Promise<AccessRole | null> {
  const trimmed = (code || "").trim();
  if (!trimmed) return null;
  try {
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: trimmed }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.success && typeof json.role === "string" ? (json.role as AccessRole) : null;
  } catch {
    return null;
  }
}
