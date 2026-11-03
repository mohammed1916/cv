import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm';

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, phases, examples, complexity,
  inputLabel: 'Lowercase string (1 to 200 letters)',
  url: 'https://leetcode.com/problems/longest-substring-with-at-most-two-distinct-characters/',
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
      <p>The window always holds at most two distinct characters. Each new right edge may add a third kind, so the left edge moves until only two remain.</p>
      <p>Counts track how many of each character sit inside the window; removing a count to zero deletes that key, which keeps the distinct count exact.</p>
      <p>Every index enters and leaves the window at most once, so the whole scan is linear.</p>
    </>} />;
}

export default withProblemStory(Visualizer, storyGuide);
