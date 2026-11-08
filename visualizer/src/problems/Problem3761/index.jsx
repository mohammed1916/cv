import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no recorded values.' },
    { id: 'match', label: 'Match', description: 'This value is the reverse of an earlier one.' },
    { id: 'record', label: 'Record', description: 'Store this value reversed for later matches.' },
    { id: 'done', label: 'Complete', description: 'Report the smallest gap.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums, for example {"nums":[12,21,45,33,54]}',
  url: 'https://leetcode.com/problems/minimum-absolute-distance-between-mirror-pairs/',
  complexity: 'O(n) expected time with a hash map. The visualization caps the array at 12 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[12,21,45,33,54]}' },
    { label: 'Example 3', input: '{"nums":[21,120]}' },
    { label: "Single value", input: "{\"nums\":[1]}" },
    { label: "Equal values", input: "{\"nums\":[21,21,21]}" },
    { label: "Largest values at the limit", input: "{\"nums\":[1000000000,1,1000000000,999999999,2,1000000000,3,1000000000,1000000000,4,5,6]}" },
    { label: "Long run: 12 values", input: "{\"nums\":[11637561,6969721,123246,14871645,16167748,12790591,7952474,4887621,13176740,10831066,4343436,5303883]}" },
  ],
}

export default function MirrorPairDistance() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.index} />
    <output aria-label="Best">{`Best gap so far: ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>A mirror pair is an earlier index i and a later index j where reverse(nums[i]) equals nums[j].</p>
    <p>The map stores the latest index for each reversed value, so every later element finds its nearest mirror in one lookup.</p>
  </>} />
}
