import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import FoldView from './FoldView'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  number: '2626',
  phases: [
    { id: 'start', label: 'Start', description: 'Set the accumulator to init.' },
    { id: 'step', label: 'Combine', description: 'Combine the accumulator with one element.' },
    { id: 'done', label: 'Result', description: 'The final accumulator.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'JSON object with nums (up to 8 whole numbers), init, and fn ("sum" or "squareSum")',
  url: 'https://leetcode.com/problems/array-reduce-transformation/',
  complexity: 'O(n) time and O(1) extra space for n elements.',
  examples: [
    { label: 'Sum', input: '{"nums":[2,5,1],"init":3}' },
    { label: 'Squares', input: '{"nums":[2,-3],"init":10,"fn":"squareSum"}' },
    { label: 'Empty', input: '{"nums":[],"init":7}' },
  ],
}

export default function ArrayReduceTransformation() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <FoldView view={step.view} />}
    renderReasoning={() => <>
      <p>A reduce keeps one running value. Each element is combined with that value, and the result becomes the next running value.</p>
      <p>The reducer is chosen by name in this visualization. With no elements, the initial value is returned unchanged.</p>
    </>} />
}
