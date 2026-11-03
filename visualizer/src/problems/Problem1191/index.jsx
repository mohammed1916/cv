import authoredExamples0 from '../../config/examples/collection--1191.js';

import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import IndexedSequence from '../../components/shared/IndexedSequence';
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm';

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, phases,
  inputLabel: 'Array and repeat count (JSON object)',
  complexity: 'O(n) time and O(1) extra space. The visualization reports the exact integer; apply a modulus only when the judge requires one.',
  examples: authoredExamples0,
};

const shown = value => (value === null || value === undefined ? 'not computed' : String(value));

function KConcatenationMaximum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot;
    return <>
      <IndexedSequence label="One copy of the array" length={run.input.arr.length} active={s.index ?? -1}
        valueAt={i => run.input.arr[i]} />
      <table aria-label="Candidate values">
        <tbody>
          <tr><th>Copies (k)</th><td>{run.input.k}</td></tr>
          <tr><th>Best inside one copy</th><td>{shown(s.single)}</td></tr>
          <tr><th>Sum of one copy</th><td>{shown(s.total)}</td></tr>
          <tr><th>Best prefix (empty allowed)</th><td>{shown(s.prefix)}</td></tr>
          <tr><th>Best suffix (empty allowed)</th><td>{shown(s.suffix)}</td></tr>
          <tr><th>Answer</th><td>{shown(s.result)}</td></tr>
        </tbody>
      </table>
    </>;
  }} renderReasoning={() => <>
    <p>A run either stays inside one copy, or crosses at least one copy boundary. A boundary-crossing run is a suffix of one copy, followed by whole copies, followed by a prefix of a later copy.</p>
    <p>Whole middle copies are worth adding only when a copy's total is positive. With a total that is zero or negative, at most the two boundary pieces are useful.</p>
  </>} />;
}

export default withProblemStory(KConcatenationMaximum, storyGuide);
