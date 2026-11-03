import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  number: '2635',
  phases: [
    { id: 'start', label: 'Start', description: 'Empty output.' },
    { id: 'compute', label: 'Transform', description: 'Apply the transform to one element.' },
    { id: 'push', label: 'Push', description: 'Append the transformed value.' },
    { id: 'done', label: 'Result', description: 'The mapped array.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'JSON object with arr (up to 8 whole numbers)',
  url: 'https://leetcode.com/problems/apply-transform-over-each-element-in-array/',
  complexity: 'O(n) time and O(n) space for n elements.',
  examples: [
    { label: 'Three', input: '{"arr":[5,0,4]}' },
    { label: 'Negative', input: '{"arr":[-1]}' },
  ],
}

export default function ApplyTransformOverEachElement() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <section aria-label="Visual state">
      <h3>{step.view.title}</h3>
      <ol>{step.view.rows.map((row, index) => <li key={index} aria-current={index === step.view.focus ? 'step' : undefined}>{row}</li>)}</ol>
      {step.view.summary && <output>{step.view.summary}</output>}
    </section>}
    renderReasoning={() => <>
      <p>A map builds a new array of the same length. Each slot is filled from the matching input element and its position.</p>
    </>} />
}
