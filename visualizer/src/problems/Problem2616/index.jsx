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
    { label: 'Eight values, three changes', input: '{"nums":[7,19,4,25,1,13,6,22],"p":3}' },
    { label: 'Equal values, one change', input: '{"nums":[9,9,9],"p":1}' },
    { label: 'Two values, p at half length', input: '{"nums":[3,9],"p":1}' },
    { label: 'Equal values', input: '{"nums":[4,4,4,4],"p":2}' },
    { label: 'Alternating limit values', input: '{"nums":[30,0,30,0,30,0,30,0,30,0],"p":5}' },
    { label: 'Long run: ten values', input: '{"nums":[30,17,26,9,24,4,20,28,7,22],"p":3}' },
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
