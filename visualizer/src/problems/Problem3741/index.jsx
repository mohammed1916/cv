import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Positions', description: 'Record where each value occurs.' },
    { id: 'group', label: 'Group', description: 'Take the indices of one value.' },
    { id: 'triple', label: 'Triple', description: 'Three consecutive occurrences form a candidate.' },
    { id: 'update', label: 'Update', description: 'Keep the smaller distance.' },
    { id: 'done', label: 'Result', description: 'Report the minimum or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (integers 1 to 9)',
  url: 'https://leetcode.com/problems/minimum-distance-between-three-equal-elements-ii/',
  complexity: 'O(n) to group indices, then one pass over consecutive triples per value.',
  examples: [
    { label: 'Example', input: '{"nums":[1,2,1,1,3]}' },
    { label: 'No triple', input: '{"nums":[1,2,3]}' },
  ],
}

export default function MinimumDistanceThreeEqualII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.at}
      roleAt={i => (step.at >= 0 && run.input.nums[i] === run.input.nums[step.at] ? 'same value' : '')} />
    <output aria-label="Best distance">{`best = ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>Three equal values at sorted indices p &lt; q &lt; r have pairwise distances that sum to 2 * (r - p).</p>
    <p>For a fixed value, the tightest triple is always three consecutive occurrences, so only those need checking.</p>
  </>} />
}
