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
    { label: "Single element", input: "{\"nums\":[7]}" },
    { label: "Equal values use the first triple", input: "{\"nums\":[2,2,2,2,2]}" },
    { label: "Widest span at length 16", input: "{\"nums\":[1,2,3,4,5,6,7,1,8,9,2,3,4,5,6,1]}" },
    { label: "Long run: 16 values", input: "{\"nums\":[3,1,9,8,8,7,8,9,5,7,7,6,2,9,4,4]}" },
    { label: "Pairs only, no triple", input: "{\"nums\":[9,8,9,8,7,7,6,6]}" },
  ],
}

export default function MinimumDistanceThreeEqualII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.right}
      roleAt={i => (step.left < 0 ? '' : i === step.left ? 'l' : i === step.right ? 'r' : i > step.left && i < step.right ? 'window' : '')} />
    <output aria-label="Best distance">{`best = ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>Three equal values at sorted indices p &lt; q &lt; r have pairwise distances that sum to 2 * (r - p).</p>
    <p>For a fixed value, the tightest triple is always three consecutive occurrences, so only those need checking.</p>
  </>} />
}
