import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MoveSubtreeView from './MoveSubtreeView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '1516',
  phases: [
    { id: 'start', label: 'Read', description: 'Load the tree and name the moving node p and the target q.' },
    { id: 'check', label: 'Direct child?', description: 'If p already hangs under q, nothing moves.' },
    { id: 'locate', label: 'Parents', description: 'Find the parent of p and the parent of q.' },
    { id: 'decide', label: 'Inside or outside', description: 'Check whether q sits in the subtree rooted at p.' },
    { id: 'detach', label: 'Detach', description: 'Cut the node that must leave its current parent.' },
    { id: 'splice', label: 'Splice', description: 'Put q into the position p occupied.' },
    { id: 'attach', label: 'Attach', description: 'Append p as the last child of q.' },
    { id: 'done', label: 'Result', description: 'Return the root of the changed tree.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with root (val and children), p and q (e.g. {"root":{"val":1,"children":[]},"p":1,"q":1})',
  url: 'https://leetcode.com/problems/move-sub-tree-of-n-ary-tree/',
  complexity: 'O(n) time and O(h) extra space for n nodes, where h is the height, found by walking the tree once to locate parents and to test the subtree. The visualization caps the tree at 20 nodes.',
  examples: [
    { label: 'Lift the target first', input: '{"root":{"val":1,"children":[{"val":2,"children":[{"val":3,"children":[{"val":4,"children":[]}]}]},{"val":5,"children":[]}]},"p":2,"q":3}' },
    { label: 'Target outside the subtree', input: '{"root":{"val":1,"children":[{"val":2,"children":[{"val":4,"children":[]}]},{"val":3,"children":[]}]},"p":4,"q":3}' },
    { label: 'Already a child', input: '{"root":{"val":1,"children":[{"val":2,"children":[]},{"val":3,"children":[]}]},"p":2,"q":1}' },
  ],
}

export default function MoveSubtreeNAryTree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <MoveSubtreeView run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>When q lies below p, moving p first would cut q off from the tree. Lifting q into p's old slot keeps every node reachable before p is appended under q.</p>
  </>} />
}
