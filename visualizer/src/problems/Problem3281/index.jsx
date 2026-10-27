import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Bounds', description: 'Sort the range starts and set the score bounds.' },
    { id: 'probe', label: 'Place numbers', description: 'Place each number as early as the candidate gap allows inside its range.' },
    { id: 'done', label: 'Answer', description: 'Report the largest score that every range can keep.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with start (2 to 8 integers, 0 to 30) and d (0 to 10) (JSON)',
  url: 'https://leetcode.com/problems/maximize-score-of-numbers-in-ranges/',
  complexity: 'O(n log(range)) time for n ranges. The visualization caps the input at 8 ranges.',
  examples: [
    { label: 'Example 1', input: '{"start":[6,0,3],"d":2}' },
    { label: 'Example 2', input: '{"start":[2,6,13,13],"d":5}' },
  ],
}

export default function MaximizeScoreInRanges() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <AnswerRangeBar title="Score search" min={run.domain[0]} max={run.domain[1]} low={step.lo} high={step.hi} probe={step.mid} verdict={step.verdict} />
    <IndexedSequence label="Placed numbers (sorted by range start)" length={step.positions.length || run.sorted.length} valueAt={i => (step.positions.length ? step.positions[i] : run.sorted[i])} roleAt={i => `range ${run.sorted[i]}..${run.sorted[i] + run.input.d}`} />
  </>} renderReasoning={() => <>
    <p>Each range has the same width d, so placing the numbers in order of their starts keeps the order of the chosen values.</p>
    <p>Placing each number as early as possible leaves the most room for the rest, so one greedy pass decides whether a score is achievable.</p>
  </>} />
}
