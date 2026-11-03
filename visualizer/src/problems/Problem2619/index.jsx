import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  number: '2619',
  phases: [
    { id: 'check', label: 'Check length', description: 'Is there any element?' },
    { id: 'read', label: 'Read last', description: 'Read the element at length minus one.' },
    { id: 'done', label: 'Result', description: 'Report the answer.' },
  ],
  parse: parseInput, build: buildTrace, code,
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
    renderVisual={({ step }) => <section aria-label="Visual state">
      <h3>{step.view.title}</h3>
      <ol>{step.view.rows.map((row, index) => <li key={index} aria-current={index === step.view.focus ? 'step' : undefined}>{row}</li>)}</ol>
      {step.view.summary && <output>{`Answer: ${step.view.summary}`}</output>}
    </section>}
    renderReasoning={() => <>
      <p>The last position is always length minus one, so one read answers the question.</p>
      <p>An empty array has no such position, so the answer is the sentinel -1.</p>
    </>} />
}
