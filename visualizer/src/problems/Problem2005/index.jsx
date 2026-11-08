import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import FibonacciTreeView from './FibonacciTreeView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'Order zero adds no branch.' },
    { id: 'order', label: 'Order', description: 'Work out the value of this tree.' },
    { id: 'branch', label: 'Branch', description: 'Record the value as a branch of its parent.' },
    { id: 'done', label: 'Result', description: 'Alice wins when the value is not 0.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, the order of the Fibonacci tree',
  url: 'https://leetcode.com/problems/subtree-removal-game-with-fibonacci-tree/',
  complexity: 'Time O(n) and space O(n) for the branch values, using the Sprague-Grundy idea that a removal game splits into independent branches XORed together. The visualization draws the tree up to order 6 and accepts orders from 1 to 100; the text gives no official bound, which is not verified here.',
  examples: [
    { label: 'Order four', input: '{"n":4}' },
    { label: 'Order nine', input: '{"n":9}' },
    { label: 'Order thirteen', input: '{"n":13}' },
    { label: "Order one", input: "{\"n\":1}" },
    { label: "Order two", input: "{\"n\":2}" },
    { label: "Long run: order 100", input: "{\"n\":100}" },
  ],
}

export default function SubtreeRemovalFibonacciTree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <FibonacciTreeView run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Removing a branch never affects the other branches, so a tree's value is the XOR of its child branch values. A branch whose subtree has value v contributes v plus 1, and a value of 0 for the whole tree means the first player loses.</p>
  </>} />
}
