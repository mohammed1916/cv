import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Bounds', description: 'Set the search bounds from the smallest and largest house values.' },
    { id: 'probe', label: 'Test capability', description: 'Walk the houses, robbing each one within the cap and skipping its neighbour.' },
    { id: 'done', label: 'Answer', description: 'Report the smallest capability that allows k robberies.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (1 to 10 house values, 1 to 20) and k (JSON)',
  url: 'https://leetcode.com/problems/house-robber-iv/',
  complexity: 'O(n log(max value)) time. The visualization caps the input at 10 houses.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,3,5,9],"k":2}' },
    { label: 'Example 2', input: '{"nums":[2,7,9,3,1],"k":2}' },
  ],
}

export default function HouseRobberFour() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <AnswerRangeBar title="Capability search" min={run.domain[0]} max={run.domain[1]} low={step.lo} high={step.hi} probe={step.mid} verdict={step.verdict} />
    <IndexedSequence label="Houses" length={run.sorted.length} valueAt={i => run.sorted[i]} roleAt={i => (step.picked || []).includes(i) ? 'robbed' : ''} />
  </>} renderReasoning={() => <>
    <p>A capability works when at least k houses with values within it can be robbed with no two neighbours taken.</p>
    <p>Taking the leftmost eligible house and skipping its neighbour gives the maximum count for a cap, and a higher cap never robs fewer houses.</p>
  </>} />
}
