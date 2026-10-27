import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Start the total and read N from its binary form.' },
    { id: 'one', label: 'x = 1', description: 'Count x = 1, which needs no operations.' },
    { id: 'class', label: 'By popcount', description: 'Count the values below N with each number of ones.' },
    { id: 'done', label: 'Complete', description: 'Report the number of k-reducible values.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with s (binary N) and k, for example {"s":"111","k":1}',
  url: 'https://leetcode.com/problems/count-k-reducible-numbers-less-than-n/',
  complexity: 'O(L^2) time for L binary digits of N, plus a constant number of popcount steps. The visualization caps s at 12 bits.',
  examples: [
    { label: 'Example', input: '{"s":"111","k":1}' },
    { label: 'Four bits', input: '{"s":"1000","k":2}' },
  ],
}

export default function KReducibleNumbers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Binary bound">{`N = ${run.input.s} (binary), k = ${run.input.k}`}</output>
    <output aria-label="Running count">{`Count so far: ${step.count}${step.popcount ? ` · popcount class ${step.popcount}` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>Replacing x with its popcount always shrinks it, so the number of operations for x is one more than for its popcount. Only the popcount of each x matters.</p>
    <p>Binomial coefficients count how many numbers below N have each popcount, which avoids listing them.</p>
  </>} />
}
