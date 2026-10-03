import { createContext, useContext, useEffect } from 'react';

// Only the stable publisher is in context, so updating the story does not
// rerender the algorithm or restart playback. Portals preserve this context.
export const NarrativeTraceContext = createContext(null);

export function useNarrativePlayback(stepIndex, total) {
  const publish = useContext(NarrativeTraceContext);
  useEffect(() => {
    publish?.({ playback: { stepIndex, total } });
  }, [publish, stepIndex, total]);
}

export function useNarrativeTrace(step, code) {
  const publish = useContext(NarrativeTraceContext);
  useEffect(() => {
    publish?.({ step: step ?? null, code: code ?? [] });
  }, [publish, step, code]);
  useEffect(() => () => { publish?.({ step: null, code: [] }); }, [publish]);
}
