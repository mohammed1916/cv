import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import IndexedSequence from '../../components/shared/IndexedSequence';
import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import { phases, examples, parseInput, buildTrace, code, python, pythonLineMap } from './algorithm';

const definition = {
  number: '1394', phases, examples, parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel: 'Array of integers (JSON object)',
  url: 'https://leetcode.com/problems/find-lucky-integer-in-an-array/',
  complexity: 'O(n + d log d) time for n values with d distinct values; O(d) extra space for counts.',
};

function Visualizer() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => {
      const s = step.snapshot;
      return <>
        <IndexedSequence label="Distinct values with counts (ascending)" length={s.candidates.length} active={s.current}
          valueAt={i => s.candidates[i].value}
          roleAt={i => `count ${s.candidates[i].count}${s.candidates[i].count === s.candidates[i].value ? ' (lucky)' : ''}`} />
        <output>Best lucky value so far: {s.best}</output>
      </>;
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>} />;
}

export default withProblemStory(Visualizer, storyGuide);
