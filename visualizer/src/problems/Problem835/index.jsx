import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Collect ones', description: 'List the cells holding a 1 in each image.' },
    { id: 'vote', label: 'Vote for shift', description: 'Each pair of 1s votes for the translation that aligns them.' },
    { id: 'done', label: 'Complete', description: 'Return the highest vote count.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Object with matrices A and B (JSON)',
  url: 'https://leetcode.com/problems/image-overlap/',
  complexity: 'O(a * b) time for a ones in A and b ones in B (at most n^4); O(n^2) space for the vote table.',
  examples: [
    { label: 'Official example', input: '{"A": [[1,1,0],[0,1,0],[0,1,0]], "B": [[0,0,0],[0,1,1],[0,0,1]]}' },
    { label: 'Single cell', input: '{"A": [[1]], "B": [[1]]}' },
    { label: 'No overlap', input: '{"A": [[0]], "B": [[0]]}' },
  ],
}
export default function ImageOverlap() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const tally = new Map()
    for (let i = 0; i <= step.pair; i++) tally.set(run.pairs[i], (tally.get(run.pairs[i]) || 0) + 1)
    const top = [...tally.entries()].sort((x, y) => y[1] - x[1]).slice(0, 8)
    const cell = p => p ? { row: p[0], column: p[1] } : null
    return <>
      <DPTable title="Image A" values={run.input.A} activeCell={cell(step.a)} />
      <DPTable title="Image B" values={run.input.B} activeCell={cell(step.b)} />
      <IndexedSequence label="Top shifts (dr,dc: votes)" length={top.length} active={top.findIndex(([k]) => k === step.key)} valueAt={i => `${top[i][0]}: ${top[i][1]}`}
        roleAt={i => top[i][0] === step.bestKey ? 'best' : ''} />
      <output aria-label="Best overlap">{step.phase === 'done' ? 'Largest overlap' : 'Best so far'}: {step.best}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>Trying every translation costs O(n^4) cell comparisons. Voting is better: a translation overlaps a 1 of A with a 1 of B precisely when it equals their coordinate difference, so each pair adds one vote to one shift.</p>
    <p>The overlap for a shift is its vote total, and the answer is the maximum of those totals.</p>
    {step.key && <p>Current pair suggests shift ({step.key}).</p>}
  </>} />
}
