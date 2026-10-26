import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Collect the distinct x edges.' },
    { id: 'slab', label: 'Select slab', description: 'Find rectangles spanning the slab between two x edges.' },
    { id: 'cover', label: 'Merge y-intervals', description: 'Union the y-intervals and add covered height times width.' },
    { id: 'done', label: 'Complete', description: 'Return the total area modulo 1,000,000,007.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Rectangles [x1,y1,x2,y2] (JSON)',
  url: 'https://leetcode.com/problems/rectangle-area-ii/',
  complexity: 'O(n^2 log n) time (n slabs, each sorting up to n intervals) and O(n) space. Exact BigInt arithmetic avoids overflow before the final modulo.',
  examples: [
    { label: 'Example 1', input: '[[0,0,2,2],[1,0,2,3],[1,0,3,1]]' },
    { label: 'Example 2', input: '[[0,0,1000000000,1000000000]]' },
    { label: 'Staircase', input: '[[0,0,4,2],[2,1,6,4],[5,3,8,5],[1,3,3,6]]' },
  ],
}
const W = 420, H = 300, PAD = 14
export default function RectangleAreaII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const maxX = Math.max(...run.input.map(r => r[2])), maxY = Math.max(...run.input.map(r => r[3]))
    const sx = v => PAD + (v / maxX) * (W - 2 * PAD)
    const sy = v => H - PAD - (v / maxY) * (H - 2 * PAD)
    const slabX = step.slab >= 0 ? [step.xs[step.slab], step.xs[step.slab + 1]] : null
    return <>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Rectangles and the current slab" style={{ width: '100%', maxHeight: 320 }}>
        <rect x="0" y="0" width={W} height={H} fill="none" stroke="currentColor" opacity="0.15" />
        {run.input.map(([x1, y1, x2, y2], i) => <rect key={i} x={sx(x1)} y={sy(y2)} width={sx(x2) - sx(x1)} height={sy(y1) - sy(y2)} fill="#7c3aed" fillOpacity="0.16" stroke="#7c3aed" strokeWidth="1.5" />)}
        {step.xs.map(x => <line key={x} x1={sx(x)} x2={sx(x)} y1={PAD} y2={H - PAD} stroke="currentColor" opacity="0.12" strokeDasharray="3 3" />)}
        {slabX && <rect x={sx(slabX[0])} y={PAD} width={sx(slabX[1]) - sx(slabX[0])} height={H - 2 * PAD} fill="#f59e0b" fillOpacity="0.18" />}
        {slabX && step.merged.map(([a, b], i) => <rect key={i} x={sx(slabX[0])} y={sy(b)} width={sx(slabX[1]) - sx(slabX[0])} height={sy(a) - sy(b)} fill="#16a34a" fillOpacity="0.55" />)}
      </svg>
      <IndexedSequence label="Distinct x edges" length={step.xs.length} active={step.slab} valueAt={i => step.xs[i]} roleAt={i => (step.slab >= 0 && i === step.slab + 1 ? 'right edge' : '')} />
      <output aria-label="Area">{step.phase === 'done' ? `Area mod 1e9+7 = ${run.result}` : `Exact area so far: ${step.total}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why slabs:</strong> between two adjacent x edges the set of covering rectangles never changes, so the union there is a union of y-intervals times the slab width. Overlaps are counted once by clipping each interval against the highest y already covered.</p>
    <p>Green is the merged union inside the amber slab.</p>
  </>} />
}
