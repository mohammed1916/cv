import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Digits', description: 'Write n in decimal.' },
    { id: 'scan', label: 'Scan', description: 'Visit the next digit.' },
    { id: 'check', label: 'Drop zero', description: 'A zero digit is skipped.' },
    { id: 'keep', label: 'Keep', description: 'A nonzero digit joins the result.' },
    { id: 'done', label: 'Result', description: 'Read the kept digits as an integer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (positive integer)',
  url: 'https://leetcode.com/problems/remove-zeros-in-decimal-representation/',
  complexity: 'O(d) time for d decimal digits, with one pass over the digits.',
  examples: [
    { label: 'Scattered zeros', input: '{"n":1020030}' },
    { label: 'Trailing zeros', input: '{"n":1000}' },
  ],
}

export default function RemoveZerosInDecimalRepresentation() {
  const digitsOf = run => String(run.input.n).split('')
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="digits of n" length={digitsOf(run).length} valueAt={i => digitsOf(run)[i]} active={step.at}
      roleAt={i => (step.kept !== undefined && i === step.at && step.ok === false ? 'dropped' : '')} />
    <output aria-label="Kept digits">{`kept = ${step.kept || '(empty)'}`}</output>
  </>} renderReasoning={() => <>
    <p>Each digit is either a zero, which is dropped, or a nonzero digit, which is appended in order.</p>
    <p>Reading the kept digits back as an integer removes any leading zeros automatically.</p>
  </>} />
}
