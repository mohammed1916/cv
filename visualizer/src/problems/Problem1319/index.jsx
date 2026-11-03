import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1319',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and links (JSON)',
  url: 'https://leetcode.com/problems/number-of-operations-to-make-network-connected/',
  complexity: 'O((n + links) * alpha(n)) time with union-find, and O(n) space for parent pointers.',
  examples: [
    { label: 'Connects with one move', input: '{"n":6,"links":[[0,1],[0,2],[3,4],[2,3],[1,2]]}' },
    { label: 'Small triangle', input: '{"n":4,"links":[[0,1],[0,2],[1,2]]}' },
    { label: 'Too few cables', input: '{"n":5,"links":[[0,1],[2,3]]}' },
  ],
}

export default function NetworkOperations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { parent, components, spare, link, cables, needed } = step.snapshot
    return <>
      <p>Cables {cables}, needed at least {needed}. Components now: <strong>{components}</strong>{spare ? `, spare cables seen: ${spare}` : ''}</p>
      <div role="img" aria-label="Parent of each computer" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {parent.map((p, i) => {
          const active = link && (link[0] === i || link[1] === i)
          return <div key={i} style={{ minWidth: 64, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
            border: `${active ? 2 : 1}px solid ${active ? 'var(--text)' : 'var(--border)'}` }}>
            <div>computer {i}</div><small>parent {p}</small>
          </div>
        })}
      </div>
      <p>{link ? `Current cable: ${link[0]} - ${link[1]}` : 'No cable is being examined.'}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Count first:</strong> fewer than n minus one cables can never connect n computers.</p>
    <p><strong>Then merge:</strong> every cable that joins two components lowers the count by one. Cables inside a component are spare.</p>
    <p><strong>Why minus one:</strong> each relocation can move a spare cable to join two components.</p>
  </>} />
}
