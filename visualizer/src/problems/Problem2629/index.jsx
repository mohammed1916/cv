import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  number: '2629',
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the input.' },
    { id: 'apply', label: 'Apply', description: 'Apply one function, from the last to the first.' },
    { id: 'done', label: 'Result', description: 'The composed value.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'JSON object with fns (any of inc, dbl, sq; applied right to left) and x',
  url: 'https://leetcode.com/problems/function-composition/',
  complexity: 'O(k) time for k functions and O(1) extra space.',
  examples: [
    { label: 'Chain', input: '{"fns":["inc","dbl","sq"],"x":2}' },
    { label: 'Empty', input: '{"fns":[],"x":5}' },
  ],
}

export default function FunctionComposition() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <section aria-label="Visual state">
      <h3>{step.view.title}</h3>
      <ol>{step.view.rows.map((row, index) => <li key={index} aria-current={index === step.view.focus ? 'step' : undefined}>{row}</li>)}</ol>
      {step.view.summary && <output>{step.view.summary}</output>}
    </section>}
    renderReasoning={() => <>
      <p>The composed function is f(g(h(x))): the rightmost function sees the input first and each function feeds its result to the one on its left.</p>
      <p>With no functions the composition is the identity, so the input comes straight back.</p>
    </>} />
}
