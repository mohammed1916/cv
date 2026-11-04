import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

import LinkedListLane from '../../components/shared/LinkedListLane'

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
      <LinkedListLane title="Working list" nodes={s.list.map(item => ({ id: item.id, value: item.value }))}
        pointers={[
          s.prevId !== null && s.prevId !== undefined && { id: s.prevId, label: 'prev', tone: 'info' },
          s.curId !== null && s.curId !== undefined && { id: s.curId, label: 'cur', tone: 'warning' },
          s.posId !== null && s.posId !== undefined && { id: s.posId, label: 'pos', tone: 'primary' },
        ].filter(Boolean)}
        roles={{ ...(s.curId != null ? { [s.curId]: 'active' } : {}), ...(s.posId != null ? { [s.posId]: 'match' } : {}) }} />
      <p>Nodes up to <strong>prev</strong> are the sorted part. <strong>cur</strong> is the node being placed.</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Sorted prefix:</strong> the list always starts with a sorted run. Each new node either extends it or is spliced into it.</p>
    <p><strong>Dummy head:</strong> it lets the insert step work even when the new node becomes the first value.</p>
  </>} />
}
