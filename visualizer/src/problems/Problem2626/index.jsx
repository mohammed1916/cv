import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  number: '2626',
  phases: [
    { id: 'start', label: 'Start', description: 'Set the accumulator to init.' },
    { id: 'step', label: 'Combine', description: 'Combine the accumulator with one element.' },
    { id: 'done', label: 'Result', description: 'The final accumulator.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'JSON object with nums (up to 8 whole numbers) and init',
  url: 'https://leetcode.com/problems/array-reduce-transformation/',
  complexity: 'O(n) time and O(1) extra space for n elements.',
  examples: [
    { label: 'Fold', input: '{"nums":[1,2,3],"init":4}' },
    { label: 'Empty', input: '{"nums":[],"init":7}' },
  ],
}

export default function ArrayReduceTransformation() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <section aria-label="Visual state">
      <h3>{step.view.title}</h3>
      <ol>{step.view.rows.map((row, index) => <li key={index} aria-current={index === step.view.focus ? 'step' : undefined}>{row}</li>)}</ol>
      {step.view.summary && <output>{step.view.summary}</output>}
    </section>}
    renderReasoning={() => <>
      <p>A reduce keeps one running value. Each element is combined with that value, and the result becomes the next running value.</p>
      <p>The sample rule here doubles the accumulator and adds the element, which makes each step visible.</p>
    </>} />
}
