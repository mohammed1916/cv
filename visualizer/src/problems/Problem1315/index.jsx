import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'Start at the root. It has no parent and no grandparent.' },
    { id: 'visit', label: 'Visit', description: 'Look at the grandparent before deciding whether to count this node.' },
    { id: 'add', label: 'Count', description: 'The grandparent is even, so this node value joins the total.' },
    { id: 'skip', label: 'Skip', description: 'The grandparent is odd or missing, so this node is not counted.' },
    { id: 'done', label: 'Complete', description: 'Report the total of the counted values.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with values: level-order array (null = missing)',
  url: 'https://leetcode.com/problems/sum-of-nodes-with-even-valued-grandparent/',
  complexity: 'O(n) time and O(h) stack space. The visualization caps input at 15 entries.',
  examples: [
    { label: 'Example 1', input: '{"values":[6,7,8,2,7,1,3,9,null,1,4,null,null,null,5]}' },
    { label: 'Small tree', input: '{"values":[2,3,4,5,6,7,8]}' },
  ],
}

export default function SumEvenGrandparent() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    for (const id of step.counted) roles[id] = 'match'
    if (step.node !== null) roles[step.node] = 'active'
    return <>
      <BinaryTreeLane title="Tree (values)" root={run.root} roles={roles} />
      <output aria-label="Running total">{`Total so far: ${step.total}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A node counts when its grandparent has an even value, so the walk carries the parent and grandparent values down each branch.</p>
    <p>Each node is visited once, so the whole tree is handled in one depth-first pass.</p>
  </>} />
}
