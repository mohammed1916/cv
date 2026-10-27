import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LinkedListLane from '../../components/shared/LinkedListLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The running value starts at 0.' },
    { id: 'bit', label: 'Add bit', description: 'Shift the value left one place and add the node bit.' },
    { id: 'done', label: 'Complete', description: 'Report the integer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with head array of 0 and 1 bits (JSON)',
  url: 'https://leetcode.com/problems/convert-binary-number-in-a-linked-list-to-integer/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '{"head":[1,0,1]}' },
    { label: 'Example 2', input: '{"head":[0]}' },
  ],
}

export default function BinaryListToInteger() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const nodes = run.input.head.map((value, id) => ({ id, value }))
    const roles = {}
    if (step.k >= 0 && step.k < nodes.length) roles[step.k] = 'active'
    return <>
      <LinkedListLane title="Bits, most significant first" nodes={nodes} roles={roles} />
      <output aria-label="Running value">{`Running value: ${step.value}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each new bit doubles everything read so far, which is exactly how a binary numeral is read left to right.</p>
  </>} />
}
