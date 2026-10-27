import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Sort the numbers and set the search bounds.' },
    { id: 'probe', label: 'Test limit', description: 'Pair neighbours whose gap is within the candidate limit.' },
    { id: 'done', label: 'Answer', description: 'Report the smallest limit that still gives p pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (2 to 10 integers, 0 to 30) and p (JSON)',
  url: 'https://leetcode.com/problems/minimize-the-maximum-difference-of-pairs/',
  complexity: 'O(n log(max value)) time. The visualization caps the input at 10 numbers.',
  examples: [
    { label: 'Example 1', input: '{"nums":[10,1,2,7,1,3],"p":2}' },
    { label: 'Example 2', input: '{"nums":[4,2,1,2],"p":1}' },
  ],
}

export default function MinimizeMaxPairDifference() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <AnswerRangeBar title="Limit search" min={run.domain[0]} max={run.domain[1]} low={step.lo} high={step.hi} probe={step.mid} verdict={step.verdict} />
    <IndexedSequence label="Sorted numbers" length={run.sorted.length} valueAt={i => run.sorted[i]} roleAt={i => (step.picked || []).includes(i) ? 'paired' : ''} />
  </>} renderReasoning={() => <>
    <p>Once the numbers are sorted, the best pairs are always neighbours, so a pair is only worth checking against adjacent values.</p>
    <p>A larger limit never allows fewer disjoint pairs, so the search can narrow to the smallest limit that gives p pairs.</p>
  </>} />
}
