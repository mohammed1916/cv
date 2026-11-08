import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Count up to r, then remove the count below l.' },
    { id: 'digit', label: 'Digit', description: 'Walk the base-b digits of the bound and add the completions.' },
    { id: 'done', label: 'Complete', description: 'Report the difference modulo 1000000007.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with decimal strings l and r and a base b, for example {"l": "23", "r": "28", "b": 8}',
  url: 'https://leetcode.doocs.org/en/lc/3519/',
  complexity: 'O(d * b) digit steps with binomial lookups, for d base-b digits. The visualization caps input at 30 decimal digits.',
  examples: [
    { label: 'Two-digit to three-digit, base three', input: '{"l":"47","r":"113","b":3}' },
    { label: 'Single value in base seven', input: '{"l":"5","r":"5","b":7}' },
    { label: 'Single digit, base two', input: '{"l":"0","r":"0","b":2}' },
    { label: 'Equal bounds tie', input: '{"l":"5","r":"5","b":10}' },
    { label: 'Largest 30-digit range', input: '{"l":"1","r":"999999999999999999999999999999","b":2}' },
    { label: 'Long run: 30 digits, base 3', input: '{"l":"123456789012345678901234567890","r":"123456789012345678901234570000","b":3}' },
  ],
}

export default function NonDecreasingDigits() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    {step.digits && <IndexedSequence label={`Base-${run.input.b} digits of the ${step.part === 'l-1' ? 'bound below l' : 'upper bound'}`} length={step.digits.length}
      valueAt={index => step.digits[index]} active={step.position} roleAt={index => index < step.position ? 'matched' : index === step.position ? 'choosing' : 'open'} />}
    <output aria-label="Current bound">{`Counting ${step.part === 'l-1' ? 'below l' : 'up to r'}, digit ${step.digit ?? '-'} at position ${step.position}`}</output>
    <output aria-label="Running count">{`Count so far: ${step.total} (base ${run.input.b})`}</output>
  </>} renderReasoning={() => <>
    <p>Count the qualifying numbers up to r, subtract the count up to l minus one, and reduce modulo 1000000007.</p>
    <p>Shorter numbers are multiset counts; for the bound itself, each smaller digit that keeps the order opens a block of completions counted in one binomial.</p>
  </>} />
}
