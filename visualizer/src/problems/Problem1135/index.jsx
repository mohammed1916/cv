import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with cities and roads [a, b, cost] (JSON)',
  url: 'https://leetcode.com/problems/connecting-cities-with-minimum-cost/',
  complexity: 'O(m log m) time to sort m roads, plus near-constant union-find work per road. The visualization caps the input at 8 cities and 20 roads.',
  examples: [
    { label: 'Triangle', input: '{"cities":3,"roads":[[1,2,5],[1,3,6],[2,3,1]]}' },
    { label: 'Unreachable city', input: '{"cities":4,"roads":[[1,2,3],[3,4,4]]}' },
    { label: 'Single city', input: '{"cities":1,"roads":[]}' },
  ],
}

export default function ConnectingCities() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { cities } = run.input
    const { parent, joined, total, current } = step.snapshot
    const rootOf = c => { let x = c; while (parent[x - 1] !== x) x = parent[x - 1]; return x }
    return <>
      <div role="img" aria-label="Groups of cities" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {Array.from({ length: cities }, (_, i) => {
          const city = i + 1
          const isCurrent = current && current.includes(city)
          return <div key={city} data-city={city} style={{
            width: 64, padding: 6, textAlign: 'center', fontFamily: 'monospace',
            border: `${isCurrent ? 2 : 1}px solid ${isCurrent ? 'var(--text)' : 'var(--border)'}`,
          }}>
            <div>City {city}</div><div style={{ color: 'var(--text-dim)' }}>group {rootOf(city)}</div>
          </div>
        })}
      </div>
      <p>{joined.length ? `Built roads: ${joined.map(([a, b]) => `${a}-${b}`).join(', ')}` : 'No roads built yet.'}</p>
      <output aria-label="Total cost">{`Total cost ${total}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Cheapest first:</strong> the cheapest road that joins two separate groups is always safe to build.</p>
    <p><strong>Skip loops:</strong> a road whose ends are already connected would only add cost, so it is skipped.</p>
  </>} />
}
