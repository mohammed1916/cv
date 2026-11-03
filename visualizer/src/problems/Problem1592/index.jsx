import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm';

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, phases, examples, complexity,
  inputLabel: 'Text of lowercase letters and spaces',
  url: 'https://leetcode.com/problems/rearrange-spaces-between-words/',
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
      <p>Words are the runs of letters; the total space count is fixed, so the only choice is how to spread it.</p>
      <p>Equal gaps are the total spaces divided by the number of gaps; the remainder becomes trailing spaces.</p>
      <p>A single word has no gaps, so all of its spaces trail it.</p>
    </>} />;
}

export default withProblemStory(Visualizer, storyGuide);
