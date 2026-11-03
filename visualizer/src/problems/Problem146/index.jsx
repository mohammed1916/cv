import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '146',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with capacity, commands and args (JSON)',
  url: 'https://leetcode.com/problems/lru-cache/',
  complexity: 'O(1) expected time per get and put: the map finds a node, and the list relinks it without scanning.',
  examples: [
    { label: 'Refresh on read', input: '{"capacity":2,"commands":["put","put","get","put","get","get"],"args":[[1,10],[2,20],[1],[3,30],[2],[1]]}' },
    { label: 'Update keeps size', input: '{"capacity":2,"commands":["put","put","put","get","get"],"args":[[1,1],[2,2],[1,9],[1],[2]]}' },
    { label: 'Capacity one', input: '{"capacity":1,"commands":["put","get","put","get","get"],"args":[[0,4],[0],[1,5],[0],[1]]}' },
  ],
}

const slot = {
  minWidth: 64, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace', color: 'inherit',
}

export default function LRUCache() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { capacity, order, size, command, key, hit, value, evicted, outputs } = step.snapshot
    return <>
      <p><strong>Recency list</strong> (most recent on the left, least recent on the right). Slots used: {size} of {capacity}.</p>
      <div role="img" aria-label="Recency list from most to least recent" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {order.length === 0 && <span>empty</span>}
        {order.map((k, i) => <div key={k} style={{
          ...slot,
          border: `${k === key ? 2 : 1}px solid ${k === evicted ? '#dc2626' : k === key ? 'var(--text)' : 'var(--border)'}`,
          background: i === 0 ? 'var(--surface2)' : 'transparent',
        }}>
          <div>key {k}</div><small>{k === key && value !== undefined ? `value ${value}` : ' '}</small>
        </div>)}
      </div>
      <p>{command === null ? 'Ready for the first operation.' : `${command === 'get' ? `get(${key})` : `put(${key}, ${value})`}: ${hit === undefined ? '' : hit ? 'key present' : 'key absent'}${evicted !== undefined ? `, key ${evicted} evicted` : ''}.`}</p>
      <p style={{ fontFamily: 'monospace' }}>outputs: [{outputs.map(o => (o === null ? 'null' : o)).join(', ')}]</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Two structures, one job each:</strong> the map answers "is this key cached, and where?" in constant expected time, and the doubly linked list keeps recency order so the least recent node is always at the back.</p>
    <p><strong>Why both moves matter:</strong> a read or an update makes a key most recent; a new key may evict only the back node, which is the least recently used.</p>
  </>} />
}
