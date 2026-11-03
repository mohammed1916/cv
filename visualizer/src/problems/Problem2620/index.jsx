import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  number: '2620',
  phases: [
    { id: 'start', label: 'Start', description: 'Store the starting number.' },
    { id: 'call', label: 'Call', description: 'Return the current value.' },
    { id: 'advance', label: 'Advance', description: 'Add one for the next call.' },
    { id: 'done', label: 'Result', description: 'All answers recorded.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'JSON object with init (integer) and calls (how many calls to make)',
  url: 'https://leetcode.com/problems/counter/',
  complexity: 'O(k) time for k calls and O(k) space for the recorded answers.',
  examples: [
    { label: 'Positive', input: '{"init":10,"calls":3}' },
    { label: 'Negative', input: '{"init":-2,"calls":4}' },
  ],
}

export default function Counter() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <section aria-label="Visual state">
      <h3>{step.view.title}</h3>
      <ol>{step.view.rows.map((row, index) => <li key={index} aria-current={index === step.view.focus ? 'step' : undefined}>{row}</li>)}</ol>
      {step.view.summary && <output>{step.view.summary}</output>}
    </section>}
    renderReasoning={() => <>
      <p>The closure keeps one variable alive between calls. Each call reads it before changing it.</p>
      <p>Returning the old value and then incrementing gives n, n+1, n+2, and so on.</p>
    </>} />
}
