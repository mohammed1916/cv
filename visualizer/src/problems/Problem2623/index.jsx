import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  number: '2623',
  phases: [
    { id: 'start', label: 'Start', description: 'Create an empty cache.' },
    { id: 'key', label: 'Key', description: 'Turn the arguments into a key.' },
    { id: 'hit', label: 'Hit', description: 'Reuse a stored answer.' },
    { id: 'miss', label: 'Miss', description: 'Run the function and store it.' },
    { id: 'return', label: 'Return', description: 'Answer this call.' },
    { id: 'done', label: 'Result', description: 'Totals.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'JSON object with calls: a list of argument lists (up to 3 whole numbers each)',
  url: 'https://leetcode.com/problems/memoize/',
  complexity: 'O(total argument size) per call to build keys; each distinct argument list runs fn once.',
  examples: [
    { label: 'Repeats', input: '{"calls":[[1,2],[1,2],[3]]}' },
    { label: 'Empty args', input: '{"calls":[[],[],[5]]}' },
  ],
}

export default function Memoize() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <section aria-label="Visual state">
      <h3>{step.view.title}</h3>
      <ol>{step.view.rows.map((row, index) => <li key={index} aria-current={index === step.view.focus ? 'step' : undefined}>{row}</li>)}</ol>
      {step.view.summary && <output>{step.view.summary}</output>}
    </section>}
    renderReasoning={() => <>
      <p>The cache maps an argument list to its answer. A repeated list is a hit and skips the real function.</p>
      <p>Serialising the arguments into a key lets equal lists match even though each call creates a new array.</p>
    </>} />
}
