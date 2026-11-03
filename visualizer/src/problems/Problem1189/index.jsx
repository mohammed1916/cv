import authoredExamples0 from '../../config/examples/collection--1189.js';

import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import IndexedSequence from '../../components/shared/IndexedSequence';
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm';

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, phases,
  inputLabel: 'Text (JSON object)',
  complexity: 'O(n) time and O(1) extra space for the fixed five-letter pattern.',
  examples: authoredExamples0,
};

const NEED = { b: 1, a: 1, l: 2, o: 2, n: 1 };

function MaximumBalloons() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot;
    return <>
      <IndexedSequence label="Characters in the text" length={run.input.text.length} active={s.index ?? -1}
        valueAt={i => run.input.text[i]}
        roleAt={i => (run.input.text[i] in NEED ? 'pattern letter' : 'ignored')} />
      <table aria-label="Letter supply and demand">
        <thead><tr><th>Letter</th><th>Needed per copy</th><th>Available</th><th>Copies allowed</th></tr></thead>
        <tbody>{Object.keys(NEED).map(letter => <tr key={letter}>
          <th>{letter}</th><td>{NEED[letter]}</td><td>{s.supply[letter]}</td>
          <td>{step.phase === 'limit' && s.letter === letter ? s.limit : step.phase === 'done' ? Math.floor(s.supply[letter] / NEED[letter]) : ''}</td>
        </tr>)}</tbody>
      </table>
      <output aria-label="Complete copies so far">{Number.isFinite(s.copies) ? `Copies so far: ${s.copies}` : 'Copies so far: not yet limited'}</output>
    </>;
  }} renderReasoning={() => <>
    <p>Only b, a, l, o and n matter. Each complete copy consumes one b, one a, two l, two o and one n, so the scarcest letter after division sets the count.</p>
    <p>Two l letters in the text allow one copy, not two, because each copy needs two of them. Other characters do not change the result.</p>
  </>} />;
}

export default withProblemStory(MaximumBalloons, storyGuide);
