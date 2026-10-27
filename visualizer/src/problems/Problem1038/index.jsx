import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with a running sum of zero.' },
    { id: 'visit', label: 'Visit', description: 'Visit the right subtree, then the node, then the left subtree.' },
    { id: 'done', label: 'Complete', description: 'Report the converted tree in level order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with root (level-order array, a valid BST)',
  url: 'https://leetcode.com/problems/binary-search-tree-to-greater-sum-tree/',
  complexity: 'O(n) time and O(h) recursion space. The visualization caps input at 10 nodes.',
  examples: [
    { label: 'Example 1', input: '{"root":[4,1,6,0,2,5,7,null,null,null,3,null,null,null,8]}' },
    { label: 'Small tree', input: '{"root":[2,1,3]}' },
  ],
}

export default function GreaterSumTree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <BinaryTreeLane title="Input tree" root={run.root} roles={step.node === null ? {} : { [step.node]: 'active' }} />
    <output aria-label="Running sum">{`Running sum ${step.running}${step.original === null ? '' : `, node ${step.original} stores ${step.running}`}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Visiting right first means every value that is larger has already been added to the running sum when a node is reached.</p>
  </>} />
}
