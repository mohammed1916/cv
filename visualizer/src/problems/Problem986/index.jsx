import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Two lists', description: 'Start at the first interval of each list.' },
    { id: 'overlap', label: 'Overlap', description: 'Keep the shared part of the two current intervals.' },
    { id: 'skip', label: 'No overlap', description: 'Advance the interval that ends first.' },
    { id: 'done', label: 'Complete', description: 'Report every overlap.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Two interval lists a and b (JSON)',
  url: 'https://leetcode.com/problems/interval-list-intersections/',
  complexity: 'O(m + n) time for lists of m and n intervals. The visualization caps each list at 12 intervals.',
  examples: [
    { label: 'Example 1', input: '{"a":[[0,2],[5,10],[13,23],[24,25]],"b":[[1,5],[8,12],[15,24],[25,26]]}' },
  ],
}

export default function IntervalListIntersections() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="List a" length={run.input.a.length} active={step.i} valueAt={i => `[${run.input.a[i]}]`} />
    <IndexedSequence label="List b" length={run.input.b.length} active={step.j} valueAt={i => `[${run.input.b[i]}]`} />
    <output aria-label="Overlaps">{`Overlaps: ${step.result.map(r => `[${r}]`).join(', ') || 'none yet'}`}</output>
  </>} renderReasoning={() => <>
    <p>Both lists are sorted and disjoint, so the intervals that could overlap move forward together. An interval that ends first cannot overlap anything after the other list’s current interval, so it can be dropped.</p>
    <p>Each step either records an overlap or advances one pointer, so the walk is linear.</p>
  </>} />
}
