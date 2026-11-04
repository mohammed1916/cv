import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No candidate has been built yet.' },
    { id: 'try', label: 'Try order', description: 'Merge the three strings in this order and compare the result.' },
    { id: 'better', label: 'New best', description: 'This candidate is shorter, or equally short and smaller.' },
    { id: 'done', label: 'Complete', description: 'Report the shortest candidate.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Three strings (JSON object with a, b and c)',
  url: 'https://leetcode.com/problems/shortest-string-that-contains-three-strings/',
  complexity: 'O(1) orders, each merge O(n^2) for n total letters. The visualization caps each string at 6 letters.',
  examples: [
    { label: 'Example 1', input: '{"a":"abc","b":"bca","c":"aaa"}' },
    { label: 'Example 2', input: '{"a":"ab","b":"ba","c":"aba"}' },
  ],
}

function OrderTable({ frames, current }) {
  const orders = frames.filter(f => f.order)
  return <table aria-label="Merge orders" style={{ borderCollapse: 'collapse', width: '100%', color: 'var(--text)' }}>
    <thead><tr>
      {['Order (p, q, r)', 'Candidate', 'Length', 'Status'].map(h => <th key={h} scope="col" style={{ textAlign: 'left', padding: '4px 8px', borderBottom: '2px solid var(--border, currentColor)' }}>{h}</th>)}
    </tr></thead>
    <tbody>{orders.map((f, i) => {
      const isCurrent = frames.indexOf(f) === current
      const isBest = f.candidate === f.best && f.phase === 'better'
      return <tr key={i} data-current={isCurrent} style={{ background: isCurrent ? 'var(--primary)' : 'transparent', color: isCurrent ? '#fff' : 'var(--text)' }}>
        <td style={{ padding: '4px 8px' }}>{f.order}</td>
        <td style={{ padding: '4px 8px', fontFamily: 'monospace' }}>{f.candidate}</td>
        <td style={{ padding: '4px 8px' }}>{f.candidate.length}</td>
        <td style={{ padding: '4px 8px' }}>{isBest ? 'new best' : 'not better'}</td>
      </tr>
    })}</tbody>
  </table>
}

export default function ShortestStringThatContainsThree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <section aria-label="Input strings">
      <ol style={{ color: 'var(--text)' }}>
        {['a', 'b', 'c'].map(k => <li key={k}>{`${k} = ${run.input[k]}`}</li>)}
      </ol>
    </section>
    <OrderTable frames={run.frames} current={run.frames.indexOf(step)} />
    <output aria-label="Candidate" style={{ color: 'var(--text)' }}>{`Order: ${step.order || '(none)'}, candidate: ${step.candidate || '(none)'}, best: ${step.best || '(none)'}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Some pair of strings is always merged first. Overlapping the ends of two strings saves the most letters, and trying every order covers every merge.</p>
  </>} />
}
