import authoredExamples0 from '../../config/examples/collection--1190.js';

import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import IndexedSequence from '../../components/shared/IndexedSequence';
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm';

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, phases,
  inputLabel: 'Text with brackets (JSON object)',
  complexity: 'O(n) time and O(n) extra space: a stack pairs brackets, then one walk writes each letter once.',
  examples: authoredExamples0,
};

function ReverseInParentheses() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot;
    const text = run.input.s;
    return <>
      <IndexedSequence label="Characters and their walk position" length={text.length} active={s.index ?? -1}
        valueAt={i => text[i]}
        roleAt={i => (text[i] === '(' || text[i] === ')' ? (s.partner[i] >= 0 ? 'bracket pair' : 'bracket') : 'letter')} />
      <table aria-label="Walk state">
        <tbody>
          <tr><th>Direction</th><td>{s.direction > 0 ? 'right' : s.direction < 0 ? 'left' : 'not started'}</td></tr>
          <tr><th>Output so far</th><td>{s.out || 'empty'}</td></tr>
        </tbody>
      </table>
    </>;
  }} renderReasoning={() => <>
    <p>Each bracket is linked to its partner once. Walking through a bracket jumps to the far side and reverses direction, so the contents of a group are read in reverse without moving letters.</p>
    <p>A nested group simply flips direction again, which makes inner reversals compose correctly in one pass.</p>
  </>} />;
}

export default withProblemStory(ReverseInParentheses, storyGuide);
