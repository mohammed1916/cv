import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Bounds', description: 'Set the search over seconds and confirm the full length can work.' },
    { id: 'probe', label: 'Test second', description: 'Schedule the decrements before each index’s last marking second.' },
    { id: 'done', label: 'Answer', description: 'Report the earliest second, or -1 when no second works.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (1 to 4 values, 0 to 3) and changeIndices (1 to 8 one-based indices) (JSON)',
  url: 'https://leetcode.com/problems/earliest-second-to-mark-indices-i/',
  complexity: 'O(log m * (n + m)) time for the check. The visualization caps n at 4 and m at 8.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,2,0],"changeIndices":[2,2,2,2,3,2,2,1]}' },
    { label: 'Example 2', input: '{"nums":[1,3],"changeIndices":[1,1,1,2,1,1,1]}' },
  ],
}

export default function EarliestSecondMarkIndicesOne() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <AnswerRangeBar title="Second search" min={run.domain[0]} max={run.domain[1]} low={step.lo} high={step.hi} probe={step.mid} verdict={step.verdict} />
    <IndexedSequence label="Last marking second per index (0 means never seen)" length={run.input.nums.length} valueAt={i => step.last[i] ?? 0} roleAt={i => `needs ${run.input.nums[i]}`} />
  </>} renderReasoning={() => <>
    <p>An index can be marked at a second only when its value is already zero, so its decrements must all come before its last appearance.</p>
    <p>Each second holds one action. Seconds that are a last appearance are reserved for marking, and the rest are free for decrements, which a deadline count checks.</p>
  </>} />
}
