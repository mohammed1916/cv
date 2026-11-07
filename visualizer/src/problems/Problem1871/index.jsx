import authoredExamples0 from '../../config/examples/collection--1871.js';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import IndexedSequence from '../../components/shared/IndexedSequence';
import { definitions } from '../families/collectionStories/definitionGroups/broad.js';
import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import './JumpWindow.css';

const base = definitions[1871];
const definition = { ...base, examples: authoredExamples0, build(input) {
  const run = base.build(input);
  return { ...run, frames: run.frames.filter(frame => frame.jumpWindow) };
} };

function roleFor(k, w, s) {
  if (k === w.destination) return 'destination';
  if (k === w.entering) return 'entering';
  if (k === w.leaving) return 'leaving';
  if (w.contributors.includes(k)) return 'contributor';
  if (s[k] === '1') return 'blocked';
  if (w.earliest !== null && k >= w.earliest && k <= w.latest) return 'window';
  if (w.reachable[k]) return 'reachable';
  return '';
}

function JumpWindowView({ step }) {
  const w = step.jumpWindow, s = step.sequence;
  const decision = w.decided === null ? 'Pending' : w.decided ? 'Reachable' : 'Unreachable';
  const range = w.earliest === null ? 'empty: no legal predecessor exists yet' : `[${w.earliest}..${w.latest}]`;
  return <div className="jump-window">
    <IndexedSequence label="Launch positions (1 = blocked)" length={s.length} active={w.destination}
      valueAt={k => s[k]} roleAt={k => roleFor(k, w, s)} />
    <dl className="jump-window__facts" aria-label="Legal predecessor window">
      <dt>Destination</dt><dd>{w.destination}</dd>
      <dt>Legal predecessors</dt><dd>{range}</dd>
      <dt>Enters the window</dt><dd>{w.entering === null ? 'none yet' : `${w.entering} (${w.enterValue ? 'reachable' : 'unreachable'})`}</dd>
      <dt>Leaves the window</dt><dd>{w.leaving === null ? 'none yet' : `${w.leaving} (${w.leaveValue ? 'reachable' : 'unreachable'})`}</dd>
      <dt>Reachable contributors</dt><dd>{w.contributors.length ? w.contributors.join(', ') : 'none'}</dd>
      <dt>Count in window</dt><dd>{w.count}</dd>
      <dt>Destination character</dt><dd>{s[w.destination]==='1' ? "'1': blocked" : "'0': open"}</dd>
      <dt>Decision</dt><dd>{decision}</dd>
    </dl>
    <p className="jump-window__reason">{w.reason}</p>
  </div>;
}

function Visualizer() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <JumpWindowView step={step} />}
    renderReasoning={() => <>
      <p>Position i can be reached from any earlier position j with minJump &lt;= i - j &lt;= maxJump. The legal window for i is therefore [i-maxJump, i-minJump].</p>
      <p>The window slides right by one each step. The position entering on the right may add a reachable contributor; the position leaving on the left may remove one.</p>
      <p>A destination becomes reachable only when it is '0' and the window still contains a reachable position. A blocked '1' stays unreachable regardless of the count.</p>
    </>} />;
}
export default withProblemStory(Visualizer, storyGuide);
