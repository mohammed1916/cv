import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import { buildTrace, parseInput, code, python, pythonLineMap, phases, examples, complexity } from './algorithm';

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, phases, examples, complexity,
  inputLabel: 'JSON array of log entries',
  url: 'https://leetcode.com/problems/crawler-log-folder/',
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
      <p>Each name followed by a slash moves one folder deeper, while a parent move steps back toward the main folder.</p>
      <p>A parent move at the main folder is ignored, so depth never drops below zero.</p>
      <p>A same-folder marker leaves the depth unchanged, so only the final depth is returned.</p>
    </>} />;
}

export default withProblemStory(Visualizer, storyGuide);
