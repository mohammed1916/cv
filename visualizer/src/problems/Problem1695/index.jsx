import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import IndexedSequence from '../../components/shared/IndexedSequence';
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm';

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, phases,
  inputLabel: 'Positive integers as a JSON array',
  url: 'https://leetcode.com/problems/maximum-erasure-value/',
  complexity: 'O(n) time and O(u) space, where u is the number of distinct values in the window.',
  examples: [
    { label: 'Repeat early', input: '[4, 2, 4, 5, 6]' },
    { label: 'Repeat late', input: '[5, 2, 1, 2, 5, 2, 1, 2, 5]' },
    { label: 'All equal', input: '[3, 3, 3]' },
    { label: 'Single value', input: '[9]' },
  ],
}

function MaxUniqueWindow() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { left, right, total, best, value, seen } = step.snapshot
    const windowEnd = step.phase === 'inspect' || step.phase === 'shrink' ? right - 1 : right
    return <>
      <IndexedSequence label="Input values" length={run.input.length}
        active={Math.max(0, right)} valueAt={index => run.input[index]}
        roleAt={index => (index === right ? 'incoming' : index >= left && index <= windowEnd ? 'window' : index < left ? 'dropped' : '')} />
      <dl aria-label="Window summary">
        <dt>Window</dt><dd>{right < 0 ? 'empty' : `indices ${left} to ${windowEnd}`}</dd>
        <dt>Incoming value</dt><dd>{value ?? 'none yet'}{seen >= 0 ? ` (last seen at ${seen})` : ''}</dd>
        <dt>Window sum</dt><dd>{total}</dd>
        <dt>Best so far</dt><dd>{best}</dd>
      </dl>
    </>
  }} renderReasoning={() => <>
    <p>A window with no repeated value is the only kind that can be counted. Extending right is safe until the incoming value already sits inside the window.</p>
    <p>When it does, jumping the left edge past the old copy restores uniqueness in one move. Every value is added and removed at most once, so the scan is linear.</p>
  </>} />
}

export default withProblemStory(MaxUniqueWindow, storyGuide);
