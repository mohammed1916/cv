import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IntervalView from '../../components/shared/IntervalView'
import { intervalView } from '../../components/shared/intervalModel.js'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Sort intervals by end, then by start descending.' },
    { id: 'compare', label: 'Inspect', description: 'Compare the interval start with the last two chosen points.' },
    { id: 'add2', label: 'Add two', description: 'No chosen point inside: add the two rightmost points.' },
    { id: 'add1', label: 'Add one', description: 'One chosen point inside: add the rightmost point.' },
    { id: 'skip', label: 'Skip', description: 'Both chosen points are inside already.' },
    { id: 'done', label: 'Complete', description: 'Return the number of chosen points.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Intervals (JSON)',
  url: 'https://leetcode.com/problems/set-intersection-size-at-least-two/',
  complexity: 'O(n log n) time for sorting plus one pass; capped at 40 intervals.',
  examples: [
    { label: 'Example 1', input: '[[1,3],[3,7],[8,9]]' },
    { label: 'Example 2', input: '[[1,3],[1,4],[2,5],[3,5]]' },
    { label: 'Example 3', input: '[[1,2],[2,3],[2,4],[4,5]]' },
  ],
}

export default function SetIntersectionSizeTwo() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    {(() => {
      const { interval } = intervalView({ title: 'Intervals sorted by right end, with the points chosen so far', closed: true, note: step.message, marker: step.index >= 0 ? run.sorted[step.index][1] : null, markerLabel: 'current end',
        intervals: [...run.sorted.map(([start, end], i) => ({ start, end, group: 'Sorted intervals', role: i === step.index ? (step.phase === 'skip' ? 'kept' : 'current') : i < step.index ? 'done' : 'pending' })), ...step.chosen.map(p => ({ start: p, end: p, label: String(p), group: 'Chosen points', role: 'merged' }))] })
      return interval ? <IntervalView {...interval} /> : null
    })()}
    <IndexedSequence label="Intervals sorted by end" length={run.sorted.length} active={step.index} valueAt={i => `[${run.sorted[i][0]}, ${run.sorted[i][1]}]`} roleAt={i => i < step.index ? 'done' : ''} />
    <IndexedSequence label="Chosen points" length={step.chosen.length} valueAt={i => step.chosen[i]} active={step.chosen.length - 1} />
    <output aria-label="Last two points">Last two points: {step.a === null || step.a < 0 ? 'none' : step.a}, {step.b === null || step.b < 0 ? 'none' : step.b}</output>
  </>} renderReasoning={() => <>
    <p>Processing by right end means every later interval ends no earlier, so a chosen point as far right as possible is never worse. Only the two largest chosen points can lie inside a later interval, so just those are tracked.</p>
  </>} />
}
