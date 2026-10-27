import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LinkedListLane from '../../components/shared/LinkedListLane'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the least significant digit.' },
    { id: 'digit', label: 'Digit', description: 'Double one digit, add the carry, and write the low digit.' },
    { id: 'carry', label: 'Final carry', description: 'A carry left over becomes a new leading digit.' },
    { id: 'done', label: 'Complete', description: 'Read the digits in the right order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with head array of digits, most significant first (JSON)',
  url: 'https://leetcode.com/problems/double-a-number-represented-as-a-linked-list/',
  complexity: 'O(n) time and O(n) space for the output digits.',
  examples: [
    { label: 'Example 1', input: '{"head":[1,8,9]}' },
    { label: 'Example 2', input: '{"head":[9,9,9]}' },
  ],
}

export default function DoubleList() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const nodes = run.input.head.map((value, id) => ({ id, value }))
    const roles = {}
    if (step.k >= 0 && step.k < nodes.length) roles[step.k] = 'active'
    return <>
      <LinkedListLane title="Digits, most significant first" nodes={nodes} roles={roles} />
      <IndexedSequence label="Written digits (least significant first)" length={step.digits.length} valueAt={i => step.digits[i]} />
      <output aria-label="Carry">{`Carry: ${step.carry}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Doubling is done from the least significant digit, so the carry flows toward the head of the list.</p>
    <p>The digits are written in reverse order and then reversed once to give the answer.</p>
  </>} />
}
