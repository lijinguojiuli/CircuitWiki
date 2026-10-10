"use client";

import { useSyncExternalStore } from "react";
import { articles } from "./content";

type StudyState = { completed: readonly string[]; lastSlug: string | null };
const empty: StudyState = { completed: [], lastSlug: null };
const key = "circuitwiki:study:v1";
const validSlugs = new Set(articles.map((article) => article.slug));
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedState = empty;
let memoryOnly = false;

function read(): StudyState {
  if (typeof window === "undefined") return empty;
  if (memoryOnly) return cachedState;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === cachedRaw) return cachedState;
    cachedRaw = raw;
    const data: unknown = raw ? JSON.parse(raw) : null;
    if (!data || typeof data !== "object") return (cachedState = empty);
    const record = data as Record<string, unknown>;
    cachedState = {
      completed: Array.isArray(record.completed)
        ? [
            ...new Set(
              record.completed.filter(
                (slug): slug is string =>
                  typeof slug === "string" && validSlugs.has(slug),
              ),
            ),
          ]
        : [],
      lastSlug:
        typeof record.lastSlug === "string" && validSlugs.has(record.lastSlug)
          ? record.lastSlug
          : null,
    };
    return cachedState;
  } catch {
    // Storage may be unavailable; keep an in-memory record for this visit.
    return cachedState;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function write(state: StudyState) {
  cachedState = state;
  cachedRaw = JSON.stringify(state);
  try {
    window.localStorage.setItem(key, cachedRaw);
  } catch {
    // A failed write must not be replaced by older readable storage data.
    memoryOnly = true;
  }
  listeners.forEach((listener) => listener());
}

export function recordVisit(slug: string) {
  const state = read();
  if (validSlugs.has(slug) && state.lastSlug !== slug)
    write({ ...state, lastSlug: slug });
}

export function toggleCompleted(slug: string) {
  if (!validSlugs.has(slug)) return;
  const state = read();
  write({
    ...state,
    completed: state.completed.includes(slug)
      ? state.completed.filter((item) => item !== slug)
      : [...state.completed, slug],
  });
}

export function useStudy() {
  return useSyncExternalStore(subscribe, read, () => empty);
}
