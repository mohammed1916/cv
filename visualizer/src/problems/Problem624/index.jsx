import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'First array', description: 'Track the range of the first array.' },
    { id: 'compare', label: 'Compare', description: 'Pair the current array with the earlier extremes.' },
    { id: 'update', label: 'Update range', description: 'Widen the tracked extremes.' },
    { id: 'done', label: 'Complete', description: 'Return the best distance.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Arrays (JSON array of arrays)',
  url: 'https://leetcode.com/problems/maximum-distance-in-arrays/',
  complexity: 'O(total length) time and O(1) extra space: only the running minimum and maximum are kept.',
  examples: [
    { label: 'Two arrays', input: '[[1,2,3],[4,5],[1,2,3]]' },
    { label: 'Negative', input: '[[1],[-1]]' },
    { label: 'Three arrays', input: '[[1,4],[0,5],[-3,6]]' },
  ],
}

export default function MaxDistanceArrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Arrays">
      <thead><tr><th>Array</th><th>Values</th><th>Min</th><th>Max</th></tr></thead>
      <tbody>{run.input.map((a, i) => <tr key={i} style={{ fontWeight: i === step.array ? 700 : 400 }}>
        <td>{i}</td><td>[{a.join(', ')}]</td><td>{Math.min(...a)}</td><td>{Math.max(...a)}</td></tr>)}</tbody>
    </table>
    <output aria-label="Tracked range">Earlier range: [{step.lo}, {step.hi}] · best {step.best ?? '—'}{step.pair ? ` · pair ${step.pair.join(' and ')}` : ''}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why extremes suffice:</strong> for a fixed later value, the farthest earlier value is either the smallest or the largest, so two numbers capture every earlier array.</p>
  </>} />
}
