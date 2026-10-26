import { useCallback, useMemo, useState } from 'react';
import AlgorithmNarrative from './AlgorithmNarrative';
import { NarrativeTraceContext } from './NarrativeTraceContext';
import { catalogNarrative } from './catalogNarrative';
import styles from './withProblemStory.module.css';

export default function withProblemStory(Visualizer, guide) {
  function ProblemWithStory(props) {
    const [trace, setTrace] = useState({ step: null, code: [] });
    const publish = useCallback(value => setTrace(previous =>
      Object.entries(value).every(([key, next]) => previous[key] === next)
        ? previous : { ...previous, ...value }), []);
    const narrative = useMemo(() => catalogNarrative(guide, trace.step, trace.code, trace.playback), [trace]);
    // Reuse the child element while only the narrative changes. Algorithms
    // retain their state and docking hosts throughout playback.
    const child = useMemo(() => <Visualizer {...props} />, [props]);
    return <NarrativeTraceContext.Provider value={publish}>
      <div className={styles.workspace}>
        <details className={styles.story} open>
          <summary>Story: {guide.title}</summary>
          <div className={styles.scroll}>
            <AlgorithmNarrative definition={narrative} />
          </div>
        </details>
        <div className={styles.visualizer}>{child}</div>
      </div>
    </NarrativeTraceContext.Provider>;
  }
  ProblemWithStory.displayName = `Story(${Visualizer.displayName || Visualizer.name || guide.title})`;
  return ProblemWithStory;
}
