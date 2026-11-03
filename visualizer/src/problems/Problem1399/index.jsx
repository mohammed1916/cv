import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import IndexedSequence from '../../components/shared/IndexedSequence';
import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import { phases, examples, parseInput, buildTrace, code, python, pythonLineMap } from './algorithm';

const definition = {
  number: '1399', phases, examples, parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel: 'Upper bound n (JSON object)',
  url: 'https://leetcode.com/problems/count-largest-group/',
  complexity: 'O(n · d) time for n integers with d digits each; O(1) extra space, since digit sums are at most 36.',
};

function Visualizer() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => {
      const s = step.snapshot;
      return <>
        <IndexedSequence label="Group size by digit sum" length={37} active={s.digitSum ?? -1}
          valueAt={i => s.sizes[i] ?? 0} roleAt={i => (s.largest !== null && s.sizes[i] === s.largest ? 'largest' : '')} />
        {s.value !== null && <p>Current integer {s.value} has digit sum {s.digitSum}.</p>}
      </>;
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>} />;
}

export default withProblemStory(Visualizer, storyGuide);
