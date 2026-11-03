import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm';

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, phases, examples, complexity,
  inputLabel: 'JSON with a, b and a shared tail',
  url: 'https://leetcode.com/problems/intersection-of-two-linked-lists/',
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
      <p>Pointer A walks its list then B's; pointer B walks its list then A's. Both cover the same total length, so they meet at the first shared node.</p>
      <p>The shared tail is the same node objects in both chains, so the pointers align there; when no tail exists both reach null together.</p>
      <p>Null is a valid meeting point, which is how disjoint lists are detected.</p>
    </>} />;
}

export default withProblemStory(Visualizer, storyGuide);
