import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Prepare a right-to-left sweep.' },
    { id: 'sum', label: 'Suffix sum', description: 'Add this shift to the running total mod 26.' },
    { id: 'shift', label: 'Rotate letter', description: 'Rotate the letter by the running total.' },
    { id: 'done', label: 'Complete', description: 'Join the shifted letters.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'String and shifts (JSON)',
  url: 'https://leetcode.com/problems/shifting-letters/',
  complexity: 'O(n) time and O(n) space, instead of the O(n^2) cost of applying every shift to its prefix.',
  examples: [
    { label: 'Example 1', input: '{"s":"abc","shifts":[3,5,9]}' },
    { label: 'Example 2', input: '{"s":"aaa","shifts":[1,2,3]}' },
    { label: 'Large shifts', input: '{"s":"zebra","shifts":[1000000000,25,26,27,1]}' },
  ],
}
export default function ShiftingLetters() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Original letters" length={run.input.s.length} active={step.index} valueAt={i => run.input.s[i]} />
    <IndexedSequence label="Shifts" length={run.input.s.length} active={step.index} valueAt={i => run.input.shifts[i]} />
    <IndexedSequence label="Result so far" length={run.input.s.length} active={step.index} valueAt={i => step.res[i]} roleAt={i => (step.index >= 0 && i > step.index ? 'done' : '')} />
    <output aria-label="Total">Suffix sum mod 26: {step.total}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why mod 26 is safe:</strong> rotating by 26 returns to the same letter, so only the remainder matters. Reducing at every step keeps the running sum small even though shifts reach 1,000,000,000.</p>
  </>} />
}
