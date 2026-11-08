import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sum', description: 'Add up every element of the array.' },
    { id: 'remainder', label: 'Remainder', description: 'Find how far the sum is above a multiple of k.' },
    { id: 'done', label: 'Complete', description: 'Report the number of decrements.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums (1 to 50 values from 1 to 1000) and k (1 to 100), for example {"nums":[3,9,7],"k":5}',
  url: 'https://leetcode.com/problems/minimum-operations-to-make-array-sum-divisible-by-k/',
  complexity: 'O(n) time for the sum.',
  examples: [
    { label: 'Own case 1', input: '{"nums":[4,10,8],"k":6}' },
    { label: 'Example 2', input: '{"nums":[4,1,6],"k":5}' },
    { label: 'Single value', input: '{"nums":[9],"k":1}' },
    { label: 'Equal values tie', input: '{"nums":[7,7,7,7],"k":2}' },
    { label: 'Largest values and k', input: '{"nums":[1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1,1000,1],"k":100}' },
    { label: 'Long run: 50 values', input: '{"nums":[661,379,593,261,722,582,569,955,26,172,455,602,468,539,953,503,490,969,57,160,263,331,597,877,551,884,958,487,419,206,17,493,337,801,64,635,390,718,582,929,371,763,420,52,480,877,254,343,155,782],"k":25}' },
  ],
}

export default function SumDivisibleByK() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array values" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={-1} />
    <output aria-label="Sum">{`Sum: ${step.total}. Operations needed: ${step.remainder ?? 'not yet'}`}</output>
  </>} renderReasoning={() => <>
    <p>Each operation decreases one element by 1, which lowers the total by exactly 1.</p>
    <p>The total must reach a multiple of k, so the fewest operations is the remainder of the sum divided by k.</p>
  </>} />
}
