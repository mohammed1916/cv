import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2619',
  phases: [
    { id: 'check', label: 'Check length', description: 'Is there any element?' },
    { id: 'read', label: 'Read last', description: 'Read the element at length minus one.' },
    { id: 'done', label: 'Result', description: 'Report the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with items (at most 10 values)',
  url: 'https://leetcode.com/problems/array-prototype-last/',
  complexity: 'O(1) time and O(1) extra space.',
  examples: [
    { label: 'Mixed', input: '{"items":["a",2,null]}' },
    { label: 'Empty', input: '{"items":[]}' },
  ],
}

export default function ArrayPrototypeLast() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => {
      const items = run.input.items
      const last = items.length - 1
      const answered = step.phase === 'done'
      return <section aria-label="Visual state">
        {items.length === 0
          ? <p className="algorithm-sequence__empty">The array is empty, so there is no index length minus one. The answer is -1.</p>
          : <IndexedSequence label="Array" length={items.length} active={last}
              valueAt={index => JSON.stringify(items[index])}
              roleAt={index => (index === last ? (answered ? 'answer' : 'last index') : '')} />}
        {answered && <output>{`Answer: ${JSON.stringify(run.result)}`}</output>}
      </section>
    }}
    renderReasoning={() => <>
      <p>The last position is always length minus one, so one read answers the question.</p>
      <p>An empty array has no such position, so the answer is the sentinel -1.</p>
    </>} />
}
