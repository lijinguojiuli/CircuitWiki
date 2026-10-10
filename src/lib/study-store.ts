"use client";
import { useSyncExternalStore } from "react";
import {
  emptyStudy,
  isArticleSlug,
  normalizeStudy,
  mergeStudy,
  type StudyState,
} from "./study-data";
const key = "circuitwiki:study:v2";
const legacyKey = "circuitwiki:study:v1";
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedState = emptyStudy;
let memoryOnly = false;
function read(): StudyState {
  if (typeof window === "undefined") return emptyStudy;
  if (memoryOnly) return cachedState;
  let raw: string | null;
  try {
    raw =
      window.localStorage.getItem(key) ??
      window.localStorage.getItem(legacyKey);
  } catch {
    return cachedState;
  }
  if (raw === cachedRaw) return cachedState;
  cachedRaw = raw;
  try {
    cachedState = raw ? normalizeStudy(JSON.parse(raw)) : emptyStudy;
  } catch {
    cachedState = emptyStudy;
  }
  return cachedState;
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  const changed = (event: StorageEvent) => {
    if (event.key === key || event.key === legacyKey || event.key === null)
      listener();
  };
  window.addEventListener("storage", changed);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", changed);
  };
}
function write(state: StudyState) {
  cachedState = state;
  cachedRaw = JSON.stringify(state);
  try {
    window.localStorage.setItem(key, cachedRaw);
  } catch {
    memoryOnly = true;
  }
  listeners.forEach((listener) => listener());
}
export function recordVisit(slug: string) {
  const state = read();
  if (
    !isArticleSlug(slug) ||
    (state.lastSlug === slug &&
      state.history[0]?.slug === slug &&
      Date.now() - Date.parse(state.history[0].visitedAt) < 60_000)
  )
    return;
  const previous = state.history.find((entry) => entry.slug === slug);
  write({
    ...state,
    lastSlug: slug,
    history: [
      {
        slug,
        visitedAt: new Date().toISOString(),
        progress: previous?.progress ?? 0,
      },
      ...state.history.filter((entry) => entry.slug !== slug),
    ].slice(0, 100),
  });
}
export function recordReading(slug: string, progress: number) {
  const state = read();
  const existing = state.history.find((entry) => entry.slug === slug);
  if (!existing || !Number.isFinite(progress) || progress <= existing.progress)
    return;
  write({
    ...state,
    history: state.history.map((entry) =>
      entry.slug === slug
        ? { ...entry, progress: Math.min(100, Math.round(progress)) }
        : entry,
    ),
  });
}
function toggle(slug: string, field: "completed" | "bookmarks") {
  if (!isArticleSlug(slug)) return;
  const state = read();
  write({
    ...state,
    [field]: state[field].includes(slug)
      ? state[field].filter((item) => item !== slug)
      : [...state[field], slug],
  });
}
export const toggleCompleted = (slug: string) => toggle(slug, "completed");
export const toggleBookmark = (slug: string) => toggle(slug, "bookmarks");
export const importStudy = (state: StudyState) =>
  write(mergeStudy(read(), state));
export const useStudy = () =>
  useSyncExternalStore(subscribe, read, () => emptyStudy);
