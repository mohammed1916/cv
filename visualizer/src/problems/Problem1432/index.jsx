import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Digits', description: 'Write num as its digits.' },
    { id: 'max', label: 'Largest', description: 'Replace the first digit that is not 9 with 9 everywhere.' },
    { id: 'min', label: 'Smallest', description: 'Make the leading digit 1, or lower the first later digit to 0.' },
    { id: 'done', label: 'Difference', description: 'Subtract the smallest result from the largest.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with an integer num from 1 to 99999999',
  url: 'https://leetcode.com/problems/max-difference-you-can-get-from-changing-an-integer/',
  complexity: 'O(d) time for d digits. The visualization caps num at eight digits.',
  examples: [
    { label: 'Example 1', input: '{"num":555}' },
    { label: 'Example 2', input: '{"num":9}' },
    { label: 'Smallest number', input: '{"num":1}' },
    { label: 'Repeated digit', input: '{"num":1111}' },
    { label: 'Largest allowed', input: '{"num":99999999}' },
    { label: 'Long run: 8 digits', input: '{"num":46733354}' },
  ],
}

export default function MaxDifferenceChangingInteger() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Digits of num" length={run.text.length} valueAt={index => run.text[index]} active={-1} roleAt={index => (step.changed && run.text[index] === step.changed ? 'changed' : '')} />
    <RecordStateTable label="The two single substitutions" columns={['goal', 'digit replaced', 'result']}
      rows={[
        { goal: 'largest', 'digit replaced': step.phase === 'start' ? '—' : step.big === run.text ? 'none (all 9s)' : `${step.changed || '—'} → 9`, result: step.big ?? 'pending' },
        { goal: 'smallest', 'digit replaced': step.phase === 'done' || step.phase === 'min' ? (step.small === run.text ? 'none' : `${step.phase === 'min' ? (run.text[0] !== '1' ? run.text[0] + ' → 1' : step.changed + ' → 0') : ''}`) : '—', result: step.small ?? 'pending' },
      ]} />
    <output aria-label="Candidates">{`Largest: ${step.big ?? '(pending)'}, smallest: ${step.small ?? '(pending)'}`}</output>
  </>} renderReasoning={() => <>
    <p>One substitution is applied to get the largest value and another to get the smallest; the two are independent.</p>
    <p>For the largest, replace the first digit that is not 9. For the smallest, make the leading digit 1, or if it already is 1, lower the first later digit that is not 0 or 1 to 0.</p>
  </>} />
}
