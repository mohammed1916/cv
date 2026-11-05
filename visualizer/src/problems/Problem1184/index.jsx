import authoredExamples0 from '../../config/examples/collection--1184.js';

import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import IndexedSequence from '../../components/shared/IndexedSequence';
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm';

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, phases,
  inputLabel: 'Edge lengths, start and destination (JSON object)',
  complexity: 'O(n) time and O(1) extra space for n edges. The trace keeps one frame per edge scan.',
  examples: authoredExamples0,
};

function ShortestBusRoute() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot;
    const lengths = run.input.distance;
    return <>
      <IndexedSequence label="Edge lengths around the loop" length={lengths.length} active={s.edge}
        valueAt={i => lengths[i]}
        roleAt={i => step.phase === 'start' || step.phase === 'circle' ? '' : i === s.lo && i < s.hi ? 'l · forward gap' : i === s.hi - 1 && i >= s.lo ? 'r · forward gap' : i >= s.lo && i < s.hi ? 'forward gap' : 'other side'} />
      <table aria-label="Route totals">
        <tbody>
          <tr><th>Loop total</th><td>{s.total}</td></tr>
          <tr><th>Forward gap</th><td>{s.forward}</td></tr>
          {s.other !== undefined && <tr><th>Other side</th><td>{s.other}</td></tr>}
          {s.result !== undefined && <tr><th>Shorter side</th><td>{s.result}</td></tr>}
        </tbody>
      </table>
    </>;
  }} renderReasoning={() => <>
    <p>Edges between the two stops form one arc of the loop. Everything else forms the opposite arc, so the two arcs together make the whole loop.</p>
    <p>Computing the loop total once gives the other arc by subtraction, so only one pass over the forward edges is needed.</p>
  </>} />;
}

export default withProblemStory(ShortestBusRoute, storyGuide);
