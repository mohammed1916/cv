import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Bounds', description: 'Find the most groups whose total size could fit in the uses.' },
    { id: 'probe', label: 'Test groups', description: 'Check whether groups of sizes 1 to k can be filled from the usage limits.' },
    { id: 'done', label: 'Answer', description: 'Report the largest number of groups that can be filled.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with usageLimits (1 to 6 values, 1 to 6) (JSON)',
  url: 'https://leetcode.com/problems/maximum-number-of-groups-with-increasing-length/',
  complexity: 'O(log n * n * k) time for this check. The visualization caps the input at 6 numbers.',
  examples: [
    { label: 'Example 1', input: '{"usageLimits":[1,2,5]}' },
    { label: 'Example 2', input: '{"usageLimits":[2,1,2]}' },
  ],
}

export default function MaximumGroupsIncreasingLength() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <AnswerRangeBar title="Group count search" min={run.domain[0]} max={run.domain[1]} low={step.lo} high={step.hi} probe={step.mid} verdict={step.verdict} />
    <IndexedSequence label="Usage limits" length={run.input.usageLimits.length} valueAt={i => run.input.usageLimits[i]} />
  </>} renderReasoning={() => <>
    <p>Groups must have strictly increasing sizes, so the cheapest plan uses sizes 1, 2, up to k, and a number can join each group at most once.</p>
    <p>Checking the demands from the largest group down against the capacities of the numbers decides whether k groups can be filled, and fewer groups are always possible when more are.</p>
  </>} />
}
