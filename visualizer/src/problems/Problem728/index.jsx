import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Range', description: 'Set up the numbers to test.' },
    { id: 'keep', label: 'Keep', description: 'Every digit divides the number.' },
    { id: 'reject', label: 'Reject', description: 'A zero digit or a non-divisor disqualifies it.' },
    { id: 'done', label: 'Complete', description: 'Return every number that passed.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'left and right (JSON object)',
  url: 'https://leetcode.com/problems/self-dividing-numbers/',
  complexity: 'O(R * d) time for R numbers with d digits each, and O(output) extra space.',
  examples: [
    { label: 'Small range', input: '{"left":8,"right":16}' },
    { label: 'Two digits', input: '{"left":30,"right":40}' },
  ],
}

export default function SelfDividingNumbers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <RecordStateTable label={`Digits of ${step.n}`} columns={['digit', 'divides?']}
      rows={step.digits.map(d => ({ digit: d.digit, 'divides?': d.divides ? 'yes' : 'no' }))} activeRow={-1} />
    <output aria-label="Kept so far">{`Kept so far: ${step.result.join(', ') || 'none'}`}</output>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Each digit is taken from the right with a remainder check. A zero digit can never be used as a divisor, so it disqualifies the number outright.</p>
    <p>The number must be divided by every one of its digits, which is why a single failing digit ends the check early.</p>
  </>} />
}
