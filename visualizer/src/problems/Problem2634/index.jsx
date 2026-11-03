import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  number: '2634',
  phases: [
    { id: 'start', label: 'Start', description: 'Empty result.' },
    { id: 'check', label: 'Check', description: 'Test one element with its index.' },
    { id: 'keep', label: 'Keep', description: 'The test passes.' },
    { id: 'skip', label: 'Skip', description: 'The test fails.' },
    { id: 'done', label: 'Result', description: 'The kept list.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'JSON object with arr (up to 10 whole numbers from -5 to 30)',
  url: 'https://leetcode.com/problems/filter-elements-from-array/',
  complexity: 'O(n) time and O(n) space for the kept list.',
  examples: [
    { label: 'Mixed', input: '{"arr":[0,10,20,30]}' },
    { label: 'Dropped', input: '{"arr":[0,1,2]}' },
  ],
}

export default function FilterElementsFromArray() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <section aria-label="Visual state">
      <h3>{step.view.title}</h3>
      <ol>{step.view.rows.map((row, index) => <li key={index} aria-current={index === step.view.focus ? 'step' : undefined}>{row}</li>)}</ol>
      {step.view.summary && <output>{step.view.summary}</output>}
    </section>}
    renderReasoning={() => <>
      <p>The filter visits each element once, gives the test both the value and its position, and copies the survivors in order.</p>
    </>} />
}
