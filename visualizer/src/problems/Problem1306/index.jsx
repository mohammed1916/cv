import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1306',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with arr and start (JSON)',
  url: 'https://leetcode.com/problems/jump-game-iii/',
  complexity: 'O(n) time and O(n) space: each index is queued at most once.',
  examples: [
    { label: 'Reaches zero', input: '{"arr":[4,2,3,0,3,1,2],"start":5}' },
    { label: 'Cycle without zero', input: '{"arr":[3,0,2,1,2],"start":0}' },
    { label: 'Already zero', input: '{"arr":[0],"start":0}' },
  ],
}

export default function JumpGame() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { arr, queue, seen, current, candidate, start } = step.snapshot
    return <>
      <div role="img" aria-label="Array indices" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {arr.map((value, i) => <div key={i} data-index={i} style={{
          minWidth: 48, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
          border: `${i === current ? 2 : 1}px solid ${i === candidate ? 'var(--text)' : 'var(--border)'}`,
          background: i === current ? '#fde68a' : seen.includes(i) ? 'var(--surface2)' : 'transparent', color: '#1c1917',
        }}><div>{value}</div><small>{i}{i === start ? ' start' : ''}</small></div>)}
      </div>
      <p>Queue: {queue.length === 0 ? 'empty' : queue.join(', ')} · seen: {seen.join(', ')}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Two directions:</strong> from each index, both i + value and i − value are legal next landings.</p>
    <p><strong>Seen set:</strong> an index is queued once, so the search stops after visiting each reachable index.</p>
    <p>{step.message}</p>
  </>} />
}
