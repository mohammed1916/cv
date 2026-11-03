import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1615',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and roads (JSON)',
  url: 'https://leetcode.com/problems/maximal-network-rank/',
  complexity: 'O(n + r) to count degrees and O(n^2) to check every pair, where r is the number of roads.',
  examples: [
    { label: 'Hub city', input: '{"n":5,"roads":[[0,2],[1,2],[2,3],[2,4],[3,4]]}' },
    { label: 'Chain', input: '{"n":3,"roads":[[0,1],[1,2]]}' },
    { label: 'Disjoint roads', input: '{"n":4,"roads":[[0,1],[2,3]]}' },
  ],
}

export default function NetworkRank() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { n, degree, pair, rank, shared } = step.snapshot
    const inPair = city => pair && pair.includes(city)
    return <>
      <div role="img" aria-label="City degrees" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {Array.from({ length: n }, (_, city) => <div key={city} style={{
          minWidth: 72, padding: 8, textAlign: 'center', fontFamily: 'monospace', boxSizing: 'border-box',
          border: `${inPair(city) ? 2 : 1}px solid ${inPair(city) ? 'var(--text)' : 'var(--border)'}`,
          background: inPair(city) ? 'var(--surface2)' : 'transparent', color: 'var(--text)',
        }}><div>city {city}</div><strong>degree {degree[city]}</strong></div>)}
      </div>
      <p>{pair ? `Pair ${pair[0]} and ${pair[1]}: rank ${rank}${shared ? ' (shared road subtracted)' : ''}.` : 'Degrees are counted from the roads.'}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Degrees first:</strong> a city's degree is the number of roads attached to it.</p>
    <p><strong>Shared road once:</strong> a direct road between two cities is in both degrees, so it is subtracted exactly once.</p>
  </>} />
}
