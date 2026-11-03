import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm';

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, phases, examples, complexity,
  inputLabel: 'JSON with nums and target',
  url: 'https://leetcode.com/problems/3sum-closest/',
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
      <p>Sorting lets one value be fixed while two pointers sweep the rest in a predictable direction.</p>
      <p>A sum below the target needs a larger value, so the low pointer moves right; a sum above it moves the high pointer left.</p>
      <p>Any exact match ends the search immediately, because no other triple can be closer.</p>
    </>} />;
}

export default withProblemStory(Visualizer, storyGuide);
