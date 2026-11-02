import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No numbers have been formed.' },
    { id: 'skip', label: 'Leading zero', description: 'A zero cannot start the number.' },
    { id: 'odd', label: 'Odd end', description: 'The units digit is odd.' },
    { id: 'add', label: 'New number', description: 'A new even number joins the set.' },
    { id: 'repeat', label: 'Repeat', description: 'The number was already counted.' },
    { id: 'done', label: 'Result', description: 'Report the set size.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of digits (3 to 12 entries)',
  url: 'https://leetcode.com/problems/unique-3-digit-even-numbers/',
  complexity: 'O(n^3) time and O(n^3) space in the worst case for n digits. The visualization caps the input at 12 digits.',
  examples: [
    { label: 'Example 1', input: '[2,1,3,0]' },
    { label: 'Example 2', input: '[2,2,8,8,2]' },
    { label: 'Example 3', input: '[3,7,5]' },
  ],
}

export default function UniqueThreeDigitEvenNumbers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="digits" length={run.input.length} valueAt={i => run.input[i]} active={step.picked?.length ? step.picked[step.picked.length - 1] : -1}
      roleAt={i => (step.picked?.includes(i) ? 'window' : '')} />
    <output aria-label="Distinct even numbers">{`distinct even numbers so far: ${step.count}${step.number !== null ? `, current ${step.number}` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>Every choice of three different positions forms one candidate. The hundreds digit cannot be zero, and the units digit decides whether the number is even.</p>
    <p>A set keeps each distinct value once, so repeated digit choices that build the same number are counted only once.</p>
  </>} />
}
