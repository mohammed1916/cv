import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the boxes to place.' },
    { id: 'pyramid', label: 'Pyramid', description: 'Grow the full pyramid while it still fits.' },
    { id: 'leftover', label: 'Leftover', description: 'Boxes not used by the full pyramid.' },
    { id: 'extra', label: 'Extra floor', description: 'Add one more floor box for the leftovers.' },
    { id: 'done', label: 'Result', description: 'Report the fewest floor boxes.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Number of boxes n (1 to 1000000000)',
  url: 'https://leetcode.com/problems/building-boxes/',
  complexity: 'O(cbrt(n)) time for the pyramid search and O(sqrt(n)) for the leftover floor boxes, O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '3' },
    { label: 'Example 2', input: '4' },
    { label: 'Example 3', input: '10' },
  ],
}

const box = (state) => ({
  width: 18, height: 18, boxSizing: 'border-box', borderRadius: 3,
  border: `1px solid ${state === 'extra' ? 'var(--primary)' : 'var(--border)'}`,
  background: state === 'floor' ? 'var(--surface2)' : state === 'extra' ? 'var(--primary)' : 'var(--surface)',
})

// Floor boxes drawn as a staircase: row r holds r boxes, for m rows. Extra floor boxes sit in a strip beside it.
function Floor({ m, extra }) {
  const rows = Array.from({ length: m }, (_, r) => r + 1)
  return <div role="img" aria-label={`Floor of ${m} rows and ${extra} extra floor boxes`} style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
    <div style={{ display: 'grid', gap: 3 }}>
      {rows.map(len => <div key={len} style={{ display: 'flex', gap: 3, justifyContent: 'flex-start' }}>
        {Array.from({ length: len }, (_, k) => <span key={k} style={box('floor')} />)}
      </div>)}
    </div>
    {extra > 0 && <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', maxWidth: 140 }}>
      {Array.from({ length: extra }, (_, k) => <span key={k} style={box('extra')} />)}
    </div>}
  </div>
}

export default function BuildingBoxes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Box counts" style={{ display: 'block', fontFamily: 'monospace', marginBottom: 8 }}>{`n = ${run.input.n}, full pyramid height ${step.m}, floor boxes ${step.floor}, extra floor boxes ${step.extra}, boxes left ${step.remaining}`}</output>
    {step.m > 0 || step.extra > 0 ? <Floor m={step.m} extra={step.extra} /> : <p style={{ color: 'var(--text-muted, var(--text))' }}>No full pyramid fits yet.</p>}
    <p style={{ color: 'var(--text-muted, var(--text))', marginTop: 8 }}>Shaded cells are the floor. The highlighted cells are extra floor boxes added for the leftovers.</p>
  </>} renderReasoning={() => <>
    <p>A full pyramid of height m stacks m(m+1)(m+2)/6 boxes and needs m(m+1)/2 floor boxes. The largest such pyramid that fits is taken first.</p>
    <p>Any leftover boxes need extra floor boxes: the k-th extra floor box can support k more boxes, so the loop adds floor boxes until the leftovers are placed.</p>
  </>} />
}
