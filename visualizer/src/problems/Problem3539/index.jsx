import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MagicalLayersView from './MagicalLayersView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'
import IndexedSequence from '../../components/shared/IndexedSequence'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with m, k and nums',
  url: 'https://leetcode.com/problems/find-sum-of-array-product-of-magical-sequences/',
  complexity: 'O(n · m³ · k) time with n = nums.length, since each of the O(m² · k) states per index tries up to m copies. Officially m and k reach 30 and nums reaches 50 entries; the visualization caps m and nums at 6 to keep the states readable.',
  examples: [
    { label: 'Three positions', input: '{"m":3,"k":2,"nums":[2,3,5]}' },
    { label: 'Carries matter', input: '{"m":3,"k":1,"nums":[2,3]}' },
    { label: 'Single index', input: '{"m":2,"k":1,"nums":[6]}' },
    { label: 'One number', input: '{"m":1,"k":1,"nums":[5]}' },
    { label: 'Equal numbers', input: '{"m":2,"k":2,"nums":[3,3,3]}' },
    { label: 'Largest value', input: '{"m":3,"k":2,"nums":[100000000,1]}' },
    { label: 'Long run: 6 numbers', input: '{"m":6,"k":4,"nums":[70831070,96810867,1300739,85428059,78245125,70235001]}' },
  ],
}

export default function FindSumOfArrayProductOfMagicalSequences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <><IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} roleAt={i => i === step.index ? 'i' : ''} /><MagicalLayersView run={run} step={step} /></>} renderReasoning={() => <>
    <p>Only how many times each index appears matters to the sum of powers of two, so decide those counts one index at a time, exactly like adding binary numbers from the lowest position up.</p>
    <p>Holding t copies of 2^i plus an incoming carry leaves the low bit of that total at position i and sends the rest up. Each decided position can add at most one set bit, so the state is copies used, carry and set bits.</p>
    <p>The weight merges all sequences that share a state: C(remaining, t) picks which sequence positions hold index i, and nums[i]^t is what they multiply in. After the last index, the carry has nowhere to merge, so its own set bits count too.</p>
  </>} />
}
