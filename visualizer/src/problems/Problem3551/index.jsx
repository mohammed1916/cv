import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'target', label: 'Target order', description: 'Sort by digit sum, then by value, to get where each number belongs.' },
    { id: 'skip', label: 'Skip', description: 'This position already belongs to a cycle that was walked.' },
    { id: 'cycle', label: 'Cycle', description: 'Walk one cycle of misplaced numbers; a cycle of length L needs L minus 1 swaps.' },
    { id: 'done', label: 'Complete', description: 'Report the total number of swaps.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums (1 to 10 distinct integers from 1 to 999)',
  url: 'https://leetcode.com/problems/minimum-swaps-to-sort-by-digit-sum/',
  complexity: 'O(n log n) time for the sort and O(n) time for the cycle walk.',
  examples: [
    { label: 'Example 1', input: '{"nums":[37,100]}' },
    { label: 'Example 2', input: '{"nums":[21,12,3]}' },
  ],
}

export default function MinimumSwapsByDigitSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers in input order" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.at}
      roleAt={i => (step.visited.includes(i) ? 'visited' : '')} />
    <output aria-label="Target order">{`Target: ${step.target.join(', ')}`}</output>
    <output aria-label="Swaps so far">{`Swaps so far: ${step.swaps}`}</output>
  </>} renderReasoning={() => <>
    <p>Each number has a fixed target position in the digit-sum order, which turns the problem into a permutation.</p>
    <p>A permutation made of cycles needs exactly one swap fewer than the cycle length for each cycle.</p>
  </>} />
}
