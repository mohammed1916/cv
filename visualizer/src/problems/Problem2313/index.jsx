import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import FlipTreeView from './FlipTreeView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'leaf', label: 'Leaf', description: 'A leaf bit costs nothing to keep and one flip to change.' },
    { id: 'combine', label: 'Combine', description: 'Merge the children costs under this operator.' },
    { id: 'done', label: 'Result', description: 'Pick the cost for the requested root value.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with root and result. Nodes: {"val":0|1} leaves, {"val":2|3|4,"left","right"} OR/AND/XOR, {"val":5,"left"} NOT; result true or false',
  url: 'https://leetcode.com/problems/minimum-flips-in-binary-tree-to-get-result/',
  complexity: 'O(n) time and O(h) recursion space for n nodes and height h, computing a pair of costs per node. Operator codes follow this draft (2 OR, 3 AND, 4 XOR, 5 NOT); the visualization caps the tree at 15 nodes.',
  examples: [
    { label: 'Mixed tree', input: '{"root":{"val":3,"left":{"val":2,"left":{"val":1},"right":{"val":0}},"right":{"val":4,"left":{"val":1},"right":{"val":1}}},"result":false}' },
    { label: 'Negated leaf', input: '{"root":{"val":5,"left":{"val":0}},"result":true}' },
    { label: 'Xor chain', input: '{"root":{"val":4,"left":{"val":1},"right":{"val":4,"left":{"val":0},"right":{"val":1}}},"result":true}' },
  ],
}

export default function MinimumFlipsInBinaryTree() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <FlipTreeView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Each node keeps two costs: the flips needed to make it false and to make it true. Operators combine their children's pairs, and NOT swaps them.</p>
    </>} />
}
