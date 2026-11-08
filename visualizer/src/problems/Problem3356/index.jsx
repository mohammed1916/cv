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
    { label: 'Four values, two queries', input: '{"nums":[2,6,0,3],"queries":[[0,3,2],[1,2,4]]}' },
    { label: 'Six values, one query', input: '{"nums":[5,1,1,6,0,2],"queries":[[2,5,1]]}' },
    { label: 'Single element', input: '{"nums":[0],"queries":[[0,0,1]]}' },
    { label: 'Equal values, equal queries', input: '{"nums":[2,2,2],"queries":[[0,2,1],[0,2,1]]}' },
    { label: 'Largest values and steps', input: '{"nums":[6,6,6,6,6,6,6,6],"queries":[[0,7,4],[0,7,4],[0,7,4],[0,7,4],[0,7,4],[0,7,4],[0,7,4],[0,7,4]]}' },
    { label: 'Long run: 8 items and 8 queries', input: '{"nums":[3,0,5,5,2,6,4,1],"queries":[[6,6,3],[5,6,4],[3,5,1],[0,5,1],[4,4,3],[5,5,4],[6,6,4],[6,7,4]]}' },
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
