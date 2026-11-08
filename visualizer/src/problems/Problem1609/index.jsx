import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'Begin with the root at depth zero.' },
    { id: 'level', label: 'Check level', description: 'Test parity and ordering for this depth.' },
    { id: 'done', label: 'Verdict', description: 'Return true only when every level passes.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Tree values (JSON level-order array, null for a missing child)',
  url: 'https://leetcode.com/problems/even-odd-tree/',
  complexity: 'O(n) time and O(w) space for the widest level. The visualization caps the tree at 15 entries.',
  examples: [
    { label: 'Example 1', input: '[1,10,4,3,null,7,9,12,8,6,null,null,2]' },
    { label: 'Root even', input: '[2]' },
    { label: 'Not increasing', input: '[1,4,10]' },
    { label: "Single even root", input: "[2]" },
    { label: "Equal siblings on one level", input: "[1,2,2]" },
    { label: "Thirteen nodes, mixed levels", input: "[1,10,4,3,null,7,9,12,8,6,null,null,2]" },
    { label: "Long run: fifteen nodes", input: "[580,205,950,631,null,129,622,766,775,null,273,617,847,447,null]" },
  ],
}

export default function EvenOddTree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    for (const id of step.ids) roles[id] = step.ok ? 'active' : 'pruned'
    return <>
      <BinaryTreeLane title="Tree (depth parity rule)" root={run.root} roles={roles} />
      <output aria-label="Level state">{`Depth ${step.depth}: ${step.values.join(', ') || '(none)'}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Depth 0 is even, so the root must be odd. Each level alternates parity: even depths odd values, odd depths even values.</p>
    <p>Values must strictly increase left to right on even depths and strictly decrease on odd depths.</p>
  </>} />
}
