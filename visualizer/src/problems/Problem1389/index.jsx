import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import IndexedSequence from '../../components/shared/IndexedSequence';
import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import { phases, examples, parseInput, buildTrace, code, python, pythonLineMap } from './algorithm';

const definition = {
  number: '1389', phases, examples, parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel: 'Values and insertion positions (JSON object)',
  url: 'https://leetcode.com/problems/create-target-array-in-the-given-order/',
  complexity: 'O(n²) time in the worst case because each insertion can shift the list; O(n) space for the target.',
};

function Visualizer() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => {
      const s = step.snapshot;
      return <>
        <IndexedSequence label="Input values" length={run.input.nums.length} active={s.i}
          valueAt={i => run.input.nums[i]} roleAt={i => `slot ${run.input.index[i]}`} />
        <IndexedSequence label="Target list" length={s.target.length} active={s.position}
          valueAt={i => s.target[i]} />
        <output>{step.phase === 'done' ? 'Result size' : 'Target size'}: {s.target.length}</output>
      </>;
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>} />;
}

export default withProblemStory(Visualizer, storyGuide);
