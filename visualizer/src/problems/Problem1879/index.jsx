import authoredExamples0 from '../../config/examples/collection--1879.js';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import IndexedSequence from '../../components/shared/IndexedSequence';
import DPDependencyView from '../../components/shared/DPDependencyView';
import { definitions } from '../families/collectionStories/definitionGroups/broad.js';
import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import './Assignment.css';

const base = definitions[1879];
const definition = { ...base, examples: authoredExamples0, build(input) {
  const run = base.build(input);
  return { ...run, frames: run.frames.filter(frame => frame.assignment) };
} };

function AssignmentView({ step }) {
  const a = step.assignment;
  const isStart = a.nextMask === null;
  const fmt = v => (v === null ? 'none' : v === Infinity ? 'no cost yet' : String(v));
  return <div className="assignment-view">
    <IndexedSequence label="First array: next position" length={a.firstArray.length} active={a.firstIndex}
      valueAt={k => a.firstArray[k]} roleAt={k => (k < a.firstIndex ? 'assigned' : k === a.firstIndex && !isStart ? 'next' : '')} />
    <IndexedSequence label="Second array: candidates for this step" length={a.secondArray.length} active={a.chosen}
      valueAt={k => a.secondArray[k]} roleAt={k => (k === a.chosen ? 'pair' : a.used.includes(k) ? 'used' : 'unused')} />
    <dl className="assignment-view__facts" aria-label="Mask transition">
      <dt>Used mask</dt><dd>{a.maskBits}</dd>
      <dt>Next mask</dt><dd>{a.nextBits ?? 'none (start)'}</dd>
      {!isStart && <>
        <dt>Pair</dt><dd>nums1[{a.firstIndex}] = {a.firstValue} with nums2[{a.chosen}] = {a.chosenValue}</dd>
        <dt>XOR</dt><dd>{a.pairXor}</dd>
        <dt>Old cost dp[mask]</dt><dd>{fmt(a.oldCost)}</dd>
        <dt>Candidate cost</dt><dd>{fmt(a.candidateCost)}</dd>
        <dt>Stored cost dp[next]</dt><dd>{a.decided === null ? fmt(a.previousBest) : fmt(a.bestAfter)}</dd>
        <dt>Result</dt><dd>{a.decided === null ? 'Pending' : a.decided === 'improves' ? 'Candidate replaces stored cost' : 'Stored cost kept'}</dd>
      </>}
    </dl>
    {!isStart && <DPDependencyView title="Mask dependency" values={step.table} shape="bitmask"
      target={a.nextMask} sources={[{ cell: a.mask, note: 'old cost', chosen: true }]}
      recurrence="dp[next] = min(dp[next], dp[mask] + nums1[used] XOR nums2[j])"
      why="Every assignment that uses the same second-array positions has the same future choices, so one stored cost per mask is enough." />}
  </div>;
}

function Visualizer() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <AssignmentView step={step} />}
    renderReasoning={() => <>
      <p>A mask lists the second-array positions already paired. Its bit count is how many first-array values are assigned, so the next first-array value is fixed by the mask.</p>
      <p>Each unused second-array position is one candidate pair. The candidate cost is the old cost for the mask plus that pair's XOR. The enlarged mask keeps the cheapest candidate it has received.</p>
      <p>The answer is the stored cost for the full mask, after every position of the second array has been used.</p>
    </>} />;
}
export default withProblemStory(Visualizer, storyGuide);
