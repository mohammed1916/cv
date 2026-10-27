import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Trie', description: 'Insert every number and record the smallest value below each node.' },
    { id: 'query', label: 'Query', description: 'Walk the trie, preferring opposite bits whose subtree allows a value at most m.' },
    { id: 'done', label: 'Complete', description: 'Report every answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums and queries, for example {"nums":[0,1,2],"queries":[[3,1]]}',
  url: 'https://leetcode.com/problems/maximum-xor-with-an-element-from-array/',
  complexity: 'O((n + q) * B) time for B = 5 bits in the visualization. The visualization caps nums at 10 and queries at 6.',
  examples: [
    { label: 'Example 1', input: '{"nums":[0,1,2,3,4],"queries":[[3,1],[1,3],[5,6]]}' },
    { label: 'Example 2', input: '{"nums":[5,2,4,6,6,3],"queries":[[12,4],[8,1],[6,3]]}' },
  ],
}

export default function MaxXorWithElement() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const m = step.m
    return <>
      <IndexedSequence label="nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]}
        roleAt={index => (run.input.nums[index] === step.chosen ? 'match' : m !== null && run.input.nums[index] > m ? 'blocked' : '')} />
      <output aria-label="Query">{step.x === null ? 'Waiting for a query' : `Query x = ${step.x}, limit m = ${step.m}`}</output>
      <output aria-label="Answers so far">{`Answers so far: [${step.answers.join(', ')}]`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each trie node stores the smallest number in its subtree. A branch with a smallest value above m holds no usable number, so the query skips it.</p>
    <p>Greedy choice from the top bit: take the opposite bit whenever a usable number exists down that branch, which maximises the xor bit by bit.</p>
  </>} />
}
