import { useSyncExternalStore } from 'react';

// GA4-style events, also pushed to window.dataLayer and kept in localStorage.

export type TrackingEventName =
  | 'experiment_exposure'
  | 'page_view'
  | 'view_item_list'
  | 'badge_impression'
  | 'select_item'
  | 'view_item'
  | 'add_to_cart'
  | 'purchase';

export interface TrackedEvent {
  id: number;
  name: TrackingEventName;
  at: string;
  params: Record<string, unknown>;
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

const STORAGE_KEY = 'wp_proto_events';
const MAX_EVENTS = 2000;

function load(): TrackedEvent[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function save(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // Storage full or blocked: keep working without saving.
  }
}

let events: TrackedEvent[] = load();
let lastId = events[0]?.id ?? 0;
const listeners = new Set<() => void>();
const exposed = new Set<string>();

function changed(): void {
  save();
  listeners.forEach((listener) => listener());
}

export function track(name: TrackingEventName, params: Record<string, unknown>): void {
  events = [{ id: ++lastId, name, at: new Date().toISOString(), params }, ...events].slice(0, MAX_EVENTS);
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: name, ...params });
  changed();
}

/** Exposure fires the first time a visitor actually sees an accu page, not at assignment. */
export function trackExposureOnce(key: string, params: Record<string, unknown>): void {
  if (!exposed.has(key)) {
    exposed.add(key);
    track('experiment_exposure', params);
  }
}

export function clearEvents(): void {
  events = [];
  exposed.clear();
  changed();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Newest first. */
export function useTrackedEvents(): TrackedEvent[] {
  return useSyncExternalStore(subscribe, () => events);
}
