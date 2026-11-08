import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'
import SetLineView from './SetLineView'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The counter starts at 1 and the added-back heap is empty.' },
    { id: 'pop', label: 'Pop', description: 'Return the heap minimum if there is one, otherwise the counter.' },
    { id: 'addBack', label: 'Add back', description: 'Put a taken number back if it is below the counter and not already present.' },
    { id: 'done', label: 'Complete', description: 'Every operation has been answered.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"operations": ["popSmallest" | "addBack", ...], "arguments": [[], [x], ...]}',
  url: 'https://leetcode.com/problems/smallest-number-in-infinite-set/',
  complexity: 'O(log n) per operation with a min heap of added-back numbers. The visualization caps input at 12 operations.',
  examples: [
    { label: 'Own: two adds and pops', input: '{"operations":["addBack","addBack","popSmallest","popSmallest","addBack","popSmallest"],"arguments":[[5],[3],[],[],[9],[]]}' },
    { label: 'Single pop', input: '{"operations":["popSmallest"],"arguments":[[]]}' },
    { label: 'Duplicate add-back is ignored', input: '{"operations":["popSmallest","addBack","addBack","popSmallest","popSmallest"],"arguments":[[],[1],[1],[],[]]}' },
    { label: 'Largest value added back', input: '{"operations":["addBack","popSmallest","popSmallest","addBack","popSmallest","popSmallest","popSmallest","popSmallest","popSmallest","popSmallest","popSmallest","popSmallest"],"arguments":[[30],[],[],[29],[],[],[],[],[],[],[],[]]}' },
    { label: 'Long run: 12 operations', input: '{"operations":["addBack","addBack","addBack","addBack","addBack","addBack","addBack","popSmallest","popSmallest","popSmallest","popSmallest","addBack"],"arguments":[[17],[10],[12],[10],[15],[25],[27],[],[],[],[],[5]]}' },
  ],
}

export default function SmallestInfiniteSet() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <SetLineView step={step} />
    <table aria-label="Infinite set state">
      <tbody>
        <tr><th scope="row">Counter (next fresh number)</th><td>{step.fresh}</td></tr>
        <tr><th scope="row">Added back (min heap)</th><td>{step.back.length ? step.back.join(', ') : 'empty'}</td></tr>
        <tr><th scope="row">Returned by this step</th><td>{step.value === null ? '-' : step.value}</td></tr>
      </tbody>
    </table>
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Only numbers that were taken and then added back need storage. Every other positive integer is still in the set, so the counter stands in for all of them.</p>
    <p>A number is stored only when it is below the counter, which keeps the heap from holding anything that is already in the set.</p>
  </>} />
}
