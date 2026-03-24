export type BodyPart =
  | { kind: "paragraph"; text: string }
  | { kind: "bullet"; text: string }
  | { kind: "tip"; text: string };

/**
 * Parses body text into structured parts.
 * - Lines starting with "- " → bullet
 * - Lines starting with "💡" or "Merkhilfe:" → tip (highlighted)
 * - Everything else → paragraph
 * Blank lines are ignored.
 */
export function parseBody(body: string): BodyPart[] {
  const lines = body.split("\n");
  const parts: BodyPart[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith("- ")) {
      parts.push({ kind: "bullet", text: line.slice(2) });
    } else if (line.startsWith("💡") || line.toLowerCase().startsWith("merkhilfe:")) {
      parts.push({ kind: "tip", text: line });
    } else {
      parts.push({ kind: "paragraph", text: line });
    }
  }

  return parts;
}
