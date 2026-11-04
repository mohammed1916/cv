import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LinkedListLane from '../../components/shared/LinkedListLane'
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

export default function LRUCache() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { capacity, order, size, command, key, hit, value, evicted, outputs } = step.snapshot
    return <>
      <p><strong>Recency list</strong> (most recent on the left, least recent on the right). Slots used: {size} of {capacity}.</p>
      <LinkedListLane title="Recency list" nodes={order.map(k => ({ id: `k${k}`, value: k }))}
        pointers={order.length ? [{ id: `k${order[0]}`, label: 'MRU', tone: 'info' }, { id: `k${order[order.length - 1]}`, label: 'LRU', tone: 'warning' }] : []}
        roles={{ ...(key !== null && key !== undefined ? { [`k${key}`]: 'active' } : {}), ...(evicted !== undefined ? { [`k${evicted}`]: 'removed' } : {}) }}
        note={`Slots used: ${size} of ${capacity}. Head is most recent, tail is least recent.`} />
      <p>{command === null ? 'Ready for the first operation.' : `${command === 'get' ? `get(${key})` : `put(${key}, ${value})`}: ${hit === undefined ? '' : hit ? 'key present' : 'key absent'}${evicted !== undefined ? `, key ${evicted} evicted` : ''}.`}</p>
      <p style={{ fontFamily: 'monospace' }}>outputs: [{outputs.map(o => (o === null ? 'null' : o)).join(', ')}]</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Two structures, one job each:</strong> the map answers "is this key cached, and where?" in constant expected time, and the doubly linked list keeps recency order so the least recent node is always at the back.</p>
    <p><strong>Why both moves matter:</strong> a read or an update makes a key most recent; a new key may evict only the back node, which is the least recently used.</p>
  </>} />
}
