import authoredExamples0 from '../../config/examples/collection--1186.js';

import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import IndexedSequence from '../../components/shared/IndexedSequence';
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm';

const shown = value => (Number.isFinite(value) ? String(value) : 'none yet');

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, phases,
  inputLabel: 'Integer array (JSON object)',
  complexity: 'O(n) time and O(1) extra space: each position updates two running states.',
  examples: authoredExamples0,
};

function MaxSubarrayWithOneDeletion() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot;
    return <>
      <IndexedSequence label="Input values" length={run.input.arr.length} active={s.index ?? -1}
        valueAt={i => run.input.arr[i]}
        roleAt={i => i < (s.index ?? -1) ? 'processed' : ''} />
      <table aria-label="Running states">
        <tbody>
          <tr><th>Kept run ending here</th><td>{shown(s.keep)}</td></tr>
          <tr><th>Deleted state ending here</th><td>{shown(s.deleted)}</td></tr>
          <tr><th>Best answer so far</th><td>{shown(s.best)}</td></tr>
        </tbody>
      </table>
    </>;
  }} renderReasoning={() => <>
    <p>Track two states at each position: the best run that keeps every value, and the best run that has used its one deletion. A deletion can be taken from the kept run just before the current value, or it can continue an earlier deletion.</p>
    <p>A lone negative value must still produce an answer, so the first state always starts from a real element.</p>
  </>} />;
}

export default withProblemStory(MaxSubarrayWithOneDeletion, storyGuide);
