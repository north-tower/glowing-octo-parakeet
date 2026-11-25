export type CleanDescription = {
  paragraphs: string[];
  bullets: string[];
};

const INSTRUCTION_LINE =
  /^(sawa[,.]?\s+hapa imejazwa|copy[\s-]?paste tu|here(?:'s| is) (?:the )?(?:copy|text)|paste (?:this|the following))/i;

const CATEGORY_NAME_LINE = /^\*?new category name:?\*?/i;

function stripMarkdownNoise(line: string): string {
  let s = line.trim();
  while (s.startsWith(">")) {
    s = s.replace(/^>\s?/, "").trim();
  }
  s = s.replace(/^\*+|\*+$/g, "").trim();
  s = s.replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1");
  return s;
}

function isInstructionLine(line: string): boolean {
  const s = stripMarkdownNoise(line);
  if (!s) return true;
  if (INSTRUCTION_LINE.test(s)) return true;
  if (CATEGORY_NAME_LINE.test(s)) return true;
  return false;
}

function looksLikeBullet(raw: string, stripped: string): boolean {
  return /^[-•]\s+/.test(raw.trim()) || /^[-•]\s+/.test(stripped);
}

/**
 * Normalize pasted listing copy: drop instruction prefixes, quote markers,
 * asterisks, blank runs, and duplicate lines. `- ` lines become bullets.
 */
export function cleanDescription(raw: string | null | undefined): CleanDescription {
  const source = String(raw ?? "");
  const lines = source.replace(/\r\n/g, "\n").split("\n");

  const cleaned: { raw: string; text: string }[] = [];
  let started = false;
  for (const line of lines) {
    if (!started) {
      if (isInstructionLine(line)) continue;
      started = true;
    }
    const text = stripMarkdownNoise(line);
    if (!text && cleaned[cleaned.length - 1]?.text === "") continue;
    cleaned.push({ raw: line, text });
  }

  while (cleaned[0]?.text === "") cleaned.shift();
  while (cleaned[cleaned.length - 1]?.text === "") cleaned.pop();

  const seen = new Set<string>();
  const unique: { raw: string; text: string }[] = [];
  for (const row of cleaned) {
    if (row.text === "") {
      if (unique[unique.length - 1]?.text !== "") unique.push(row);
      continue;
    }
    const key = row.text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(row);
  }

  const bullets: string[] = [];
  const paragraphs: string[] = [];
  let buf: string[] = [];

  const flushPara = () => {
    const text = buf.join(" ").replace(/\s+/g, " ").trim();
    if (text) paragraphs.push(text);
    buf = [];
  };

  for (const row of unique) {
    if (!row.text) {
      flushPara();
      continue;
    }
    if (looksLikeBullet(row.raw, row.text)) {
      flushPara();
      const t = row.text.replace(/^[-•]\s+/, "").trim();
      if (t) bullets.push(t);
      continue;
    }
    buf.push(row.text);
  }
  flushPara();

  return { paragraphs, bullets };
}

export function descriptionHasContent(cleaned: CleanDescription): boolean {
  return cleaned.paragraphs.length > 0 || cleaned.bullets.length > 0;
}
