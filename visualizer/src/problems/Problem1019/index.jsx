import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'
import { nextGreaterTutorial } from './tutorial'
import NextGreaterVisual from './NextGreaterVisual'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"values": [...]} with values 1 to 10, in list order',
  url: 'https://leetcode.com/problems/next-greater-node-in-linked-list/',
  complexity: 'O(n) time and O(n) space with a monotonic stack.',
  examples: [
    { label: 'Example 1', input: '{"values":[2,1,5]}' },
    { label: 'Example 2', input: '{"values":[2,7,4,3,5]}' },
    { label: 'Example 3', input: '{"values":[1,7,5,1,9,2,5,1]}' },
    { label: 'Single node', input: '{"values":[1]}' },
    { label: 'Equal values in order', input: '{"values":[5,5,5,5]}' },
    { label: 'Ten values at the extremes', input: '{"values":[10,1,10,1,10,1,10,1,10,1]}' },
    { label: 'Long run: 10 values', input: '{"values":[4,2,3,6,8,7,2,8,1,5]}' },
  ],
}

export default function NextGreaterNode() {
  return <AlgorithmWorkspace definition={definition} tutorial={nextGreaterTutorial}
    renderVisual={({ run, step }) => <NextGreaterVisual run={run} step={step} />}
    renderReasoning={() => <>
      <p>The stack holds positions whose next greater value has not been seen yet, with values in decreasing order from bottom to top.</p>
      <p>A new value resolves every waiting position with a smaller value, so each position is pushed and popped at most once.</p>
    </>} />
}
