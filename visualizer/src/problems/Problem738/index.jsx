import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Digits', description: 'Split the number into digits.' },
    { id: 'scan', label: 'Scan', description: 'Digits that rise are left alone.' },
    { id: 'descent', label: 'Descent', description: 'The first drop must be repaired.' },
    { id: 'lower', label: 'Lower and step left', description: 'Lower the digit and repeat if it breaks the left side.' },
    { id: 'nine', label: 'Fill nines', description: 'Digits after the repaired one become 9.' },
    { id: 'done', label: 'Complete', description: 'Return the number.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'n (JSON integer)',
  url: 'https://leetcode.com/problems/monotone-increasing-digits/',
  complexity: 'O(d) time and O(d) space for d digits.',
  examples: [
    { label: 'Descent', input: '5423' },
    { label: 'Cascade', input: '1332' },
    { label: 'Ones', input: '1000' },
    { label: 'Zero', input: '0' },
    { label: 'Single digit', input: '9' },
    { label: 'Largest value allowed', input: '1000000000' },
    { label: 'Long run: nine digits', input: '987654321' },
  ],
}

export default function MonotoneIncreasingDigits() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Digits of the working number" length={step.digits.length} active={step.index}
      valueAt={i => step.digits[i]}
      roleAt={i => (step.phase === 'descent' || step.phase === 'lower' ? (i === step.index ? 'pivot' : '') : step.phase === 'nine' || step.phase === 'done' ? (i > step.index && step.phase === 'nine' ? 'nine' : '') : '')} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>The answer keeps the leading digits as far as possible. At the first descent the left digit is lowered by one, and any earlier digit that now exceeds its neighbour is lowered too.</p>
    <p>Every digit after the repaired position becomes 9, which is the largest value that keeps the digits rising.</p>
  </>} />
}
