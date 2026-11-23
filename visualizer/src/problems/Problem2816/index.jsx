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
  question: "Double a number stored as a linked list of digits, returning the result as a new digit list.",
  approaches: [
    { name: "Reverse then carry", intuition: "Process digits from the least significant end, carrying the tens part.", time: "O(n)", space: "O(n)" },
    { name: "Carry with a sentinel head", intuition: "Use a leading carry node so the final carry is handled uniformly.", time: "O(n)", space: "O(1) extra" },
  ],
  examples: [
    { label: 'Example 1', input: '{"head":[1,8,9]}' },
    { label: 'Example 2', input: '{"head":[9,9,9]}' },
    { label: "Single digit zero", input: "{\"head\":[0]}" },
    { label: "Carry through twelve nines", input: "{\"head\":[9,9,9,9,9,9,9,9,9,9,9,9]}" },
    { label: "Zeros inside", input: "{\"head\":[1,0,0]}" },
    { label: "Long run: 12 seeded digits", input: "{\"head\":[2,4,9,0,3,6,3,8,5,6,5,8]}" },
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
