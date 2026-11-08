import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IntervalView from '../../components/shared/IntervalView'
import { intervalView } from '../../components/shared/intervalModel.js'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the free window.' },
    { id: 'merge', label: 'Merge', description: 'Join intervals that overlap or touch.' },
    { id: 'trim', label: 'Trim', description: 'Keep the parts of each merged block outside the free window.' },
    { id: 'done', label: 'Return', description: 'The remaining intervals are the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON: {"occupiedIntervals": [[s, e], ...], "freeStart": a, "freeEnd": b}',
  url: 'https://leetcode.com/problems/filter-occupied-intervals/',
  complexity: 'O(n log n) time for sorting, and O(n) extra space. The visualization caps the input at 8 intervals on 1 to 16.',
  examples: [
    { label: 'Example 1', input: '{"occupiedIntervals":[[3,5],[6,9],[9,12],[13,15]],"freeStart":8,"freeEnd":14}' },
    { label: 'Example 2', input: '{"occupiedIntervals":[[1,4],[2,6],[8,8]],"freeStart":5,"freeEnd":7}' },
    { label: "Single occupied interval", input: '{"occupiedIntervals":[[4,4]],"freeStart":4,"freeEnd":4}' },
    { label: "Touching intervals", input: '{"occupiedIntervals":[[1,3],[4,5]],"freeStart":1,"freeEnd":16}' },
    { label: "Whole calendar occupied", input: '{"occupiedIntervals":[[1,16]],"freeStart":1,"freeEnd":16}' },
    { label: "Long run: 8 intervals", input: '{"occupiedIntervals":[[13,16],[9,15],[10,15],[12,13],[11,16],[6,15],[11,13],[10,11]],"freeStart":4,"freeEnd":13}' },
  ],
}

export default function FilterOccupiedIntervals() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { freeStart, freeEnd, occupiedIntervals } = run.input
    const sameBlock = (a, b) => a && b && a[0] === b[0] && a[1] === b[1]
    const intervals = [
      ...occupiedIntervals.map(([s, e]) => ({ start: s, end: e, role: 'pending', group: 'occupied', label: `${s}–${e}` })),
      ...step.merged.map(([s, e]) => ({ start: s, end: e, role: sameBlock([s, e], step.block) ? 'current' : 'merged', group: 'merged', label: `${s}–${e}` })),
      ...step.answer.map(([s, e]) => ({ start: s, end: e, role: 'kept', group: 'answer', label: `${s}–${e}` })),
      { start: freeStart, end: freeEnd, role: 'rejected', group: 'free', label: `free ${freeStart}–${freeEnd}` },
    ]
    const view = intervalView({ title: 'Occupied, merged and remaining time', intervals, closed: true,
      note: 'The free window is removed from each merged block; the two ends of the block being trimmed are shown as l and r.' })
    return <>
      {view.interval && <IntervalView {...view.interval} />}
      {step.block && <output aria-label="Block ends">{`Block being examined: l = ${step.block[0]}, r = ${step.block[1]}`}</output>}
      <output aria-label="Merged blocks">{`Merged: ${step.merged.map(([s, e]) => `[${s}, ${e}]`).join(', ') || 'none yet'}`}</output>
      <output aria-label="Answer so far">{`Answer so far: ${step.answer.map(([s, e]) => `[${s}, ${e}]`).join(', ') || 'none yet'}`}</output>
      <output aria-label="Step message">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Sorting by start lets each interval be compared only with the last merged block.</p>
    <p>After merging, the free window can split a block into at most two pieces, one on each side.</p>
  </>} />
}
