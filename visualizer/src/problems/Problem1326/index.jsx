import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import IntervalView from '../../components/shared/IntervalView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Nothing is watered; the covered point is zero.' },
    { id: 'open', label: 'Open tap', description: 'Open the tap that reaches farthest among those starting at or before the covered point.' },
    { id: 'stuck', label: 'Gap', description: 'No available tap reaches past the covered point.' },
    { id: 'done', label: 'Complete', description: 'Report the fewest taps.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and ranges (n plus 1 values, each 0 to 10)',
  url: 'https://leetcode.com/problems/minimum-number-of-taps-to-open-to-water-a-garden/',
  complexity: 'O(n log n) time for the sort of tap spans. The visualization caps n at 20.',
  examples: [
    { label: 'Example 1', input: '{"n":5,"ranges":[3,4,1,1,0,0]}' },
    { label: 'Example 2', input: '{"n":3,"ranges":[0,0,0,0]}' },
  ],
}

export default function MinimumTaps() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Garden metres (watered = filled)" length={run.input.n} valueAt={i => (i < step.covered ? 'wet' : 'dry')} active={Math.min(step.covered, run.input.n - 1)} roleAt={i => (i < step.covered ? 'watered' : '')} />
    <IntervalView title="Each tap's watered span" closed={false} marker={step.covered} markerLabel="watered up to"
      intervals={run.input.ranges.map((r, i) => ({ start: Math.max(0, i - r), end: Math.min(run.input.n, i + r), label: `tap ${i}`, role: Math.max(0, i - r) <= step.covered && Math.min(run.input.n, i + r) > step.covered ? 'active' : 'pending' }))} />
    <output aria-label="Taps opened">{`Taps opened: ${step.taps}. Watered up to ${step.covered} of ${run.input.n}.`}</output>
  </>} renderReasoning={() => <>
    <p>Each tap waters the interval from i minus its range to i plus its range, clipped to the garden.</p>
    <p>Opening the tap that reaches farthest among those starting at or before the covered point is always at least as good as any other choice.</p>
  </>} />
}
