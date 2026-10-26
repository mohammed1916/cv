import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Index list 1', description: 'Map each name to its position.' },
    { id: 'scan', label: 'Scan list 2', description: 'Look up each name in the map.' },
    { id: 'match', label: 'Compare sums', description: 'Keep the smallest index sum.' },
    { id: 'done', label: 'Complete', description: 'Return every name with the minimum sum.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Two lists (JSON object with list1 and list2)',
  url: 'https://leetcode.com/problems/minimum-index-sum-of-two-lists/',
  complexity: 'O(m + n) expected time with a hash map and O(m) extra space.',
  examples: [
    { label: 'Shared favourite', input: '{"list1":["Shogun","Tapioca Express","Burger King","KFC"],"list2":["Piatti","The Grill at Torrey Pines","Hungry Hunter Steakhouse","Shogun"]}' },
    { label: 'Two tied', input: '{"list1":["Shogun","Tapioca Express","Burger King","KFC"],"list2":["KFC","Shogun","Burger King"]}' },
    { label: 'Disjoint', input: '{"list1":["a"],"list2":["b"]}' },
  ],
}

export default function MinimumIndexSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="List 1 (indexed)" length={run.input.list1.length} active={-1} valueAt={i => run.input.list1[i]}
      roleAt={i => (step.name !== undefined && run.input.list1[i] === step.name ? 'match' : '')} />
    <IndexedSequence label="List 2 (scanning)" length={run.input.list2.length} active={step.j ?? -1} valueAt={i => run.input.list2[i]} />
    <output aria-label="Best so far">Best sum: {step.best ?? 'none'} · answer: {step.answer?.join(', ') || '—'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why a map:</strong> each list-2 name needs one lookup in list 1, so scanning list 2 once is enough.</p>
  </>} />
}
