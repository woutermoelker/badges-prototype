import { EXPERIMENT, type Variant } from './config';

const VISITOR_KEY = 'wp_proto_visitor_id';

// FNV-1a: a tiny hash that gives the same result on server, edge and browser.
function hash(input: string): number {
  let value = 0x811c9dc5;
  for (let index = 0; index < input.length; index++) {
    value ^= input.charCodeAt(index);
    value = Math.imul(value, 0x01000193);
  }
  return value >>> 0;
}

/** Same visitor + same experiment = same bucket (0-99), on every page and every visit. */
export function bucketFor(visitorId: string): number {
  return hash(`${EXPERIMENT.id}:${visitorId}`) % 100;
}

export function variantForBucket(bucket: number): Variant {
  return bucket < 50 ? 'control' : 'variant';
}

function newVisitorId(): string {
  return `v_${Math.random().toString(36).slice(2, 12)}`;
}

// In production this is a first-party cookie set by the server, so the variant is known before the first render.
export function loadVisitorId(): string {
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) {
      return existing;
    }
  } catch {
    // no storage, fall through
  }
  const id = newVisitorId();
  saveVisitorId(id);
  return id;
}

function saveVisitorId(visitorId: string): void {
  try {
    localStorage.setItem(VISITOR_KEY, visitorId);
  } catch {
    // no storage, the id just won't survive a reload
  }
}
