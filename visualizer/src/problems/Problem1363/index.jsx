import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, pythonLineMap, examples } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count', description: 'Count each digit and find the digit-sum remainder.' },
    { id: 'drop', label: 'Fix remainder', description: 'Drop the fewest smallest digits that fix the remainder mod 3.' },
    { id: 'build', label: 'Build', description: 'Write the remaining digits from largest to smallest.' },
    { id: 'done', label: 'Result', description: 'Return the number, or 0 for all zeros, or empty if impossible.' },
  ],
  parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel: 'Digits (JSON object with digits, e.g. {"digits":[8,1,9]})',
  url: 'https://leetcode.com/problems/largest-multiple-of-three/',
  complexity: 'O(n) time and O(1) extra space for digit counts. The visualization caps input at 50 digits.',
  examples,
}

export default function LargestMultipleOfThree() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <RecordStateTable label="Digit counts by remainder class" columns={['digit', 'mod 3', 'count left', 'status']}
        activeRow={step.focus ?? -1}
        rows={step.cnt.map((count, d) => ({
          digit: d, 'mod 3': d % 3, 'count left': count,
          status: step.removed.includes(d) ? 'dropped' : count === 0 ? 'none' : 'kept',
        }))} />
      <p>Remainder mod 3: {step.rem ?? '-'}. Dropped: {step.removed.length ? step.removed.join(', ') : 'none'}.</p>
      {step.result !== null && <p>Result: {step.result === '' ? '(empty)' : step.result}</p>}
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>} />
}
