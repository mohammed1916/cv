import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Heads', description: 'Start each list at its first value.' },
    { id: 'window', label: 'Window', description: 'Measure the range covering one value from each list.' },
    { id: 'advance', label: 'Advance smallest', description: 'Only moving the smallest value can narrow the range.' },
    { id: 'done', label: 'Complete', description: 'Return the smallest range found.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Sorted lists (JSON array of arrays)',
  url: 'https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/',
  complexity: 'O(N·k) for this visualization, which scans k pointers per step; a min-heap gives O(N log k) for N total elements across k lists.',
  examples: [
    { label: 'Classic', input: '[[4,10,15,24,26],[0,9,12,20],[5,18,22,30]]' },
    { label: 'Equal', input: '[[1,2,3],[1,2,3],[1,2,3]]' },
    { label: 'Two lists', input: '[[1,3,5],[2,4,6]]' },
  ],
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
    <output aria-label="Current range">Window: {step.range ? `[${step.range[0]}, ${step.range[1]}]` : '—'} · best: {step.best ? `[${step.best[0]}, ${step.best[1]}]` : '—'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why advance the smallest:</strong> the window's low end is the smallest current value, so moving any other pointer cannot make the low end larger.</p>
  </>} />
}
