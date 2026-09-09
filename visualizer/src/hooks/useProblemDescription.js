import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { problemDescriptionStore as store } from '../services/problemDescriptions';

export function useProblemDescription(slug) {
  const subscribe = useCallback((listener) => store.subscribe(slug, listener), [slug]);
  const getSnapshot = useCallback(() => store.getSnapshot(slug), [slug]);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const retry = useCallback(() => store.load(slug), [slug]);

  useEffect(() => {
    void store.load(slug);
  }, [slug]);

  // Snapshots are keyed by slug: a late response can never replace another problem.
  return { ...snapshot, retry };
}
