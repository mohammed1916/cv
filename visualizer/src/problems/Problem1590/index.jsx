import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm';

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, phases, examples, complexity,
  inputLabel: 'JSON with nums and p',
  url: 'https://leetcode.com/problems/make-sum-divisible-by-p/',
};

function SnapshotTable({ snapshot }) {
  return <table><caption>Algorithm state</caption><tbody>
    {Object.entries(snapshot).map(([key, value]) => <tr key={key}><th>{key}</th><td><code>{JSON.stringify(value)}</code></td></tr>)}
  </tbody></table>;
}

function Visualizer() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <>
      <SnapshotTable snapshot={step.snapshot} />
      {step.phase === 'done' && <output aria-label="Result">Result: {String(run.result)}</output>}
    </>}
    renderReasoning={() => <>
      <p>The removed block must have the remainder of the whole sum. Prefix remainders convert each block check into a lookup.</p>
      <p>Storing the latest index for each remainder gives the shortest matching block ending at the current index.</p>
      <p>Removing the entire array is not a proper removal, so when only that works the answer is -1.</p>
    </>} />;
}

export default withProblemStory(Visualizer, storyGuide);
