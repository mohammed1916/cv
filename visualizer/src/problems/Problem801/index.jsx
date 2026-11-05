import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Position 0: keep costs 0, swap costs 1.' },
    { id: 'step', label: 'Step', description: 'Each position reads the states of the position before it.' },
    { id: 'done', label: 'Complete', description: 'The cheaper of the two final states is the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'a and b (JSON object of two arrays)',
  url: 'https://leetcode.com/problems/minimum-swaps-to-make-sequences-increasing/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'One swap', input: '{"a":[1,5,4,6],"b":[2,3,7,8]}' },
    { label: 'Already rising', input: '{"a":[2,4,6,7],"b":[3,5,6,9]}' },
  ],
}

export default function MinSwapIncreasing() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <RecordStateTable label="Pairs and the cost of each choice" columns={['i', 'a[i]', 'b[i]', 'keep', 'swap']}
      rows={step.rows.map(r => ({ i: r.i, 'a[i]': r.a, 'b[i]': r.b, keep: r.keep === Infinity ? '–' : r.keep, swap: r.swap === Infinity ? '–' : r.swap }))}
      activeRow={step.rows.length - 1} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each position keeps its pair or swaps it. Keeping is allowed after a kept pair only if both values rise, and after a swapped pair only if the crossed values rise.</p>
    <p>The table records the cheapest cost of each state, and the answer is the cheaper final state.</p>
  </>} />
}
