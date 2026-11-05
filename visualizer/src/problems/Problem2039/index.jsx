import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2039',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Edges and patience values (JSON)',
  url: 'https://leetcode.com/problems/the-time-when-the-network-becomes-idle/',
  complexity: 'O(n + m) for the breadth-first search, then O(n) for the per-server formula.',
  examples: [
    { label: 'Star', input: '{"edges":[[0,1],[0,2],[0,3]],"patience":[0,1,2,3]}' },
    { label: 'Path of four', input: '{"edges":[[0,1],[1,2],[2,3]],"patience":[0,4,4,4]}' },
  ],
}

export default function NetworkBecomesIdle() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { n, dist, patience, info, current, answer } = step.snapshot
    return <>
      <table aria-label="Servers and their timing" style={{ borderCollapse: 'collapse', fontFamily: 'monospace', color: 'var(--text)' }}>
        <thead><tr>{['server', 'hops', 'patience', 'round trip', 'last send', 'last arrival'].map(h => <th key={h} style={{ padding: '2px 8px' }}>{h}</th>)}</tr></thead>
        <tbody>{Array.from({ length: n }, (_, i) => i).filter(i => i > 0).map(i => {
          const row = info.find(r => r.i === i)
          const shown = row !== undefined
          return <tr key={i} style={{ background: i === current ? 'var(--primary-glow)' : 'transparent' }}>
            <td style={{ border: '1px solid var(--border)', padding: '2px 8px' }}>{i}</td>
            <td style={{ border: '1px solid var(--border)', padding: '2px 8px' }}>{dist[i]}</td>
            <td style={{ border: '1px solid var(--border)', padding: '2px 8px' }}>{patience[i]}</td>
            <td style={{ border: '1px solid var(--border)', padding: '2px 8px' }}>{shown ? row.round : ''}</td>
            <td style={{ border: '1px solid var(--border)', padding: '2px 8px' }}>{shown ? row.lastSend : ''}</td>
            <td style={{ border: '1px solid var(--border)', padding: '2px 8px' }}>{shown ? row.arrival : ''}</td>
          </tr>
        })}</tbody>
      </table>
      <p>Latest arrival so far: <strong>{answer}</strong>. The network is idle one second after the latest arrival.</p>
    </>
  }} renderReasoning={() => <p>Each server's last request leaves at the largest multiple of its patience that is still before its reply returns. The network's last busy second is the latest such arrival, so the first idle second follows it.</p>} />
}
