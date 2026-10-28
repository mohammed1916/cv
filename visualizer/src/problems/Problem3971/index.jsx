import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Each index offers its first gain, its value.' },
    { id: 'pick', label: 'Pick', description: 'Take the largest gain, then lower that index’s next gain by its decay.' },
    { id: 'stop', label: 'Stop', description: 'Every remaining gain is zero or negative, so picking more would not help.' },
    { id: 'done', label: 'Return', description: 'Report the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON: {"value": [...], "decay": [...], "m": m}',
  url: 'https://leetcode.doocs.org/en/lc/3971/',
  complexity: 'O(m log n) time with a heap, and O(n) extra space. The visualization caps m at 12.',
  examples: [
    { label: 'Example 1', input: '{"value":[6,5,4],"decay":[2,1,1],"m":4}' },
    { label: 'Example 2', input: '{"value":[7,2,2],"decay":[3,2,1],"m":2}' },
  ],
}

export default function MaximumTotalValue() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Current gain per index" length={step.gain.length} valueAt={j => step.gain[j]} active={step.index} />
    <output aria-label="Total">{`Total so far: ${step.total}. ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>The gains of one index only fall, so the best m picks are the m largest gains across all indices, taken in order.</p>
    <p>Picking a gain that is zero or negative never helps, so the loop stops there.</p>
  </>} />
}
