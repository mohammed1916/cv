import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const node = { minWidth: 44, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace', border: '1px solid var(--border)', color: '#1c1917' }

const definition = {
  number: '147',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Values in list order (JSON array)',
  url: 'https://leetcode.com/problems/insertion-sort-list/',
  complexity: 'O(n^2) time in the worst case because each node may walk the sorted part; O(1) extra space for the pointers.',
  examples: [
    { label: 'Sample', input: '[4,2,1,3]' },
    { label: 'Duplicates', input: '[3,1,3,2,1]' },
    { label: 'Already sorted', input: '[1,2,3]' },
  ],
}

export default function InsertionSortList() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const s = step.snapshot
    return <>
      <div role="img" aria-label="Linked list" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        {s.list.map(item => {
          const tags = [item.id === s.prevId && 'prev', item.id === s.curId && 'cur', item.id === s.posId && 'pos'].filter(Boolean)
          return <div key={item.id} data-node={item.id} style={{
            ...node, border: `${tags.length ? 2 : 1}px solid ${item.id === s.curId ? 'var(--text)' : 'var(--border)'}`,
            background: item.id === s.curId ? '#fde68a' : item.id === s.posId ? '#bbf7d0' : 'transparent',
          }}><div>{item.value}</div><small>{tags.join(' ')}</small></div>
        })}
      </div>
      <p>Nodes up to <strong>prev</strong> are the sorted part. <strong>cur</strong> is the node being placed.</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Sorted prefix:</strong> the list always starts with a sorted run. Each new node either extends it or is spliced into it.</p>
    <p><strong>Dummy head:</strong> it lets the insert step work even when the new node becomes the first value.</p>
  </>} />
}
