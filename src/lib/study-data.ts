import { articles } from "./content";
import { legacyChapterTargets } from "./legacy-lessons";
export type ReadingEntry = {
  slug: string;
  visitedAt: string;
  progress: number;
};
export type StudyState = {
  version: 2;
  completed: readonly string[];
  bookmarks: readonly string[];
  history: readonly ReadingEntry[];
  lastSlug: string | null;
  retiredCompleted?: readonly string[];
};
export const emptyStudy: StudyState = {
  version: 2,
  completed: [],
  bookmarks: [],
  history: [],
  lastSlug: null,
};
const valid = new Set(articles.map((article) => article.slug));
const storedSlug = (value: unknown) =>
  typeof value === "string"
    ? valid.has(value)
      ? value
      : Object.hasOwn(legacyChapterTargets, value)
        ? legacyChapterTargets[value]
        : null
    : null;
export const isArticleSlug = (value: unknown): value is string =>
  typeof value === "string" && valid.has(value);
export function normalizeStudy(value: unknown): StudyState {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("学习记录必须是一个对象。");
  const data = value as Record<string, unknown>;
  if (data.version !== undefined && data.version !== 1 && data.version !== 2)
    throw new Error("不支持此学习记录版本。");
  if (!Array.isArray(data.completed)) throw new Error("缺少有效的完成列表。");
  const slugs = (items: unknown, migrate = false) =>
    Array.isArray(items)
      ? [
          ...new Set(
            items
              .map((item) =>
                migrate ? storedSlug(item) : isArticleSlug(item) ? item : null,
              )
              .filter((item): item is string => item !== null),
          ),
        ]
      : [];
  const history: ReadingEntry[] = [];
  for (const item of Array.isArray(data.history) ? data.history : []) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const slug = storedSlug(record.slug);
    if (
      !slug ||
      typeof record.visitedAt !== "string" ||
      !Number.isFinite(Date.parse(record.visitedAt)) ||
      history.some((entry) => entry.slug === slug)
    )
      continue;
    history.push({
      slug,
      visitedAt: record.visitedAt,
      progress:
        typeof record.progress === "number" && Number.isFinite(record.progress)
          ? Math.max(0, Math.min(100, Math.round(record.progress)))
          : 0,
    });
  }
  history.sort((a, b) => Date.parse(b.visitedAt) - Date.parse(a.visitedAt));
  return {
    version: 2,
    completed: slugs(data.completed),
    bookmarks: slugs(data.bookmarks, true),
    history: history.slice(0, 100),
    lastSlug: storedSlug(data.lastSlug) ?? history[0]?.slug ?? null,
    retiredCompleted: [
      ...new Set(
        [
          ...(Array.isArray(data.retiredCompleted)
            ? data.retiredCompleted
            : []),
          ...data.completed,
        ].filter(
          (item): item is string =>
            typeof item === "string" &&
            Object.hasOwn(legacyChapterTargets, item),
        ),
      ),
    ],
  };
}
export function parseStudyImport(text: string): StudyState {
  if (text.length > 1_000_000)
    throw new Error("文件过大，请选择 CircuitWiki 导出的学习记录。");
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("文件不是有效的 JSON 学习记录。");
  }
  return normalizeStudy(value);
}
export function mergeStudy(
  current: StudyState,
  incoming: StudyState,
): StudyState {
  const bySlug = new Map(current.history.map((entry) => [entry.slug, entry]));
  for (const entry of incoming.history) {
    const existing = bySlug.get(entry.slug);
    const latest =
      !existing || Date.parse(entry.visitedAt) > Date.parse(existing.visitedAt)
        ? entry
        : existing;
    bySlug.set(entry.slug, {
      ...latest,
      progress: Math.max(entry.progress, existing?.progress ?? 0),
    });
  }
  return normalizeStudy({
    version: 2,
    completed: [...new Set([...current.completed, ...incoming.completed])],
    bookmarks: [...new Set([...current.bookmarks, ...incoming.bookmarks])],
    retiredCompleted: [
      ...new Set([
        ...(current.retiredCompleted ?? []),
        ...(incoming.retiredCompleted ?? []),
      ]),
    ],
    history: [...bySlug.values()],
    lastSlug: current.lastSlug ?? incoming.lastSlug,
  });
}
