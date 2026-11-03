import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { phases, parseInput, buildTrace, code, python, pythonLineMap } from './algorithm'

function LevelRows({ snapshot }) {
  const { values, nxt, node, left, right, leftmost } = snapshot
  const rows = []
  for (let start = 0, size = 1; start < values.length; start += size, size *= 2) rows.push([start, size])
  const focus = i => (i === node || i === left || i === right)
  return <div>
    {rows.map(([start, size], level) => <div key={level} style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '6px 0', flexWrap: 'wrap' }}>
      <small style={{ width: 60 }}>Level {level}</small>
      {Array.from({ length: size }, (_, k) => start + k).map(i => <span key={i} style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, border: '1px solid currentColor', borderRadius: 999, padding: '4px 10px',
        fontWeight: focus(i) ? 700 : 400, outline: i === leftmost ? '2px solid #f59e0b' : 'none',
      }}>
        {values[i]}{nxt[i] !== -1 ? <span aria-label={`next ${values[nxt[i]]}`}>→ {values[nxt[i]]}</span> : <span>→ null</span>}
      </span>)}
    </div>)}
    <p>Amber ring: leftmost node of the current level. Bold: nodes touched by this step.</p>
  </div>
}

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'Perfect tree values in level order, e.g. [1,2,3,4,5,6,7]',
  complexity: 'O(n) time and O(1) extra pointers beyond the next links. The trace accepts 1, 3, 7 or 15 nodes.',
  examples: [
    { label: 'Seven nodes', input: '[1,2,3,4,5,6,7]' },
    { label: 'Three nodes', input: '[9,4,8]' },
    { label: 'Fifteen nodes', input: '[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14]' },
  ],
}

export default function NextPointersWorkspace() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => <LevelRows snapshot={step.snapshot} />}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
