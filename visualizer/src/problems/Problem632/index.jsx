import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Heads', description: 'Start each list at its first value.' },
    { id: 'window', label: 'Window', description: 'Measure the range covering one value from each list.' },
    { id: 'advance', label: 'Advance smallest', description: 'Only moving the smallest value can narrow the range.' },
    { id: 'done', label: 'Complete', description: 'Return the smallest range found.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Sorted lists (JSON array of arrays)',
  url: 'https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/',
  complexity: 'O(N·k) for this visualization, which scans k pointers per step; a min-heap gives O(N log k) for N total elements across k lists.',
  examples: [
    { label: 'Classic', input: '[[4,10,15,24,26],[0,9,12,20],[5,18,22,30]]' },
    { label: 'Equal', input: '[[1,2,3],[1,2,3],[1,2,3]]' },
    { label: 'Two lists', input: '[[1,3,5],[2,4,6]]' },
  ],
}

// Every list value on one number line; dots mark the current pointer of each list, bands show the window and the best range.
function NumberLine({ lists, values, range, best }) {
  const all = lists.flat()
  const min = Math.min(...all), max = Math.max(...all)
  const span = Math.max(1, max - min)
  const W = 560
  const x = v => 20 + ((v - min) / span) * (W - 40)
  const bandY = 70
  return <svg role="img" aria-label="Values of all lists on one number line" viewBox={`0 0 ${W} 110`} width="100%" style={{ maxWidth: W, display: 'block' }}>
    {best && <rect x={x(best[0])} y={bandY - 14} width={Math.max(2, x(best[1]) - x(best[0]))} height={28} fill="var(--surface2)" stroke="var(--primary)" />}
    {range && <rect x={x(range[0])} y={bandY - 6} width={Math.max(2, x(range[1]) - x(range[0]))} height={12} fill="var(--primary)" opacity={0.5} />}
    <line x1={20} x2={W - 20} y1={bandY + 24} y2={bandY + 24} stroke="var(--text)" />
    {lists.map((list, i) => list.map((v, j) => <circle key={`${i}-${j}`} cx={x(v)} cy={bandY + 24} r={values && values[i] === v ? 6 : 3}
      fill={values && values[i] === v ? 'var(--primary)' : 'var(--text)'} data-list={i} />))}
    <text x={20} y={100} fill="var(--text)" fontSize={11}>{min}</text>
    <text x={W - 20} y={100} textAnchor="end" fill="var(--text)" fontSize={11}>{max}</text>
  </svg>
}

export default function SmallestRange() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="List pointers">
      <thead><tr><th>List</th><th>Values</th><th>Current</th></tr></thead>
      <tbody>{run.input.map((list, i) => <tr key={i}>
        <td>{i}</td>
        <td>{list.map((v, j) => <span key={j} style={{ marginRight: 6, fontWeight: j === step.pointers[i] ? 700 : 400, color: j === step.pointers[i] ? 'var(--primary)' : undefined }}>{v}</span>)}</td>
        <td>{step.values[i]}</td>
      </tr>)}</tbody>
    </table>
    <NumberLine lists={run.input} values={step.values} range={step.range} best={step.best} />
    <output aria-label="Current range" style={{ display: 'block', color: 'var(--text)', marginTop: 8 }}>Window: {step.range ? `[${step.range[0]}, ${step.range[1]}]` : '—'} · best: {step.best ? `[${step.best[0]}, ${step.best[1]}]` : '—'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why advance the smallest:</strong> the window's low end is the smallest current value, so moving any other pointer cannot make the low end larger.</p>
  </>} />
}
