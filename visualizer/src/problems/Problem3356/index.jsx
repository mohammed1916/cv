import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no queries applied.' },
    { id: 'check', label: 'Check', description: 'Add the next query to the supply and test every position.' },
    { id: 'done', label: 'Complete', description: 'Report the first prefix that works, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and queries (JSON)',
  url: 'https://leetcode.com/problems/zero-array-transformation-ii/',
  complexity: 'O(q * n * m) time for this direct scan, and O(n) space. The visualization caps input at 8 values and 8 queries.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,0,2],"queries":[[0,2,1],[0,2,1],[1,1,3]]}' },
    { label: 'Example 2', input: '{"nums":[4,3,2,1],"queries":[[1,3,2],[0,2,1]]}' },
  ],
}

export default function ZeroArrayTwo() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Supply after the prefix" length={run.input.nums.length} valueAt={i => step.supply?.[i] ?? '·'} roleAt={i => `needs ${run.input.nums[i]}`} active={step.index} />
    <output aria-label="Prefix">{`Queries used: ${step.k}`}</output>
  </>} renderReasoning={() => <>
    <p>Each query may give any amount from zero to its value to each position it covers, independently across positions.</p>
    <p>So a prefix works exactly when every position receives at least its value in total supply.</p>
  </>} />
}
