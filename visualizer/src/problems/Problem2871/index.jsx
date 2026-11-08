import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'whole', label: 'Whole array', description: 'Check the AND of every value.' },
    { id: 'scan', label: 'Scan', description: 'Extend the current segment and update its AND.' },
    { id: 'cut', label: 'Cut', description: 'The segment AND reached zero, so a subarray closes.' },
    { id: 'done', label: 'Complete', description: 'Report the maximum count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of 1 to 14 integers from 0 to 63 (JSON)',
  url: 'https://leetcode.com/problems/split-array-into-maximum-number-of-subarrays/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps input at 14 values.',
  examples: [
    { label: 'Six mixed bits', input: '[7,3,12,0,5,9]' },
    { label: 'Two low-bit values', input: '[31,15]' },
    { label: "Single zero", input: "[0]" },
    { label: "Equal values", input: "[5,5,5]" },
    { label: "Largest value, 14 entries", input: "[63,63,63,63,63,63,63,63,63,63,63,63,63,63]" },
    { label: "Long run: 14 entries", input: "[22,44,39,60,51,19,54,58,1,33,28,53,11,35]" },
  ],
}

export default function MaxSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.length} valueAt={i => run.input[i]}
      active={step.index} roleAt={i => (step.index >= 0 && i <= step.index ? 'in scan' : '')} />
    <output aria-label="Segment state">{`Running AND: ${step.running === -1 ? 'all ones' : step.running ?? '-'}, subarrays closed: ${step.count}`}</output>
  </>} renderReasoning={() => <>
    <p>Each subarray scores its bitwise AND, and the total score is minimised first. If the AND of the whole array is nonzero, no split can lower the total below that value, so one subarray is optimal.</p>
    <p>If the whole AND is zero, closing a subarray each time its running AND reaches zero gives a total of zero with the most subarrays.</p>
  </>} />
}
