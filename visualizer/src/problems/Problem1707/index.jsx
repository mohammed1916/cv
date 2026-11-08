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
    { label: 'Own case 1', input: '{"nums":[1,2,3,4,5],"queries":[[4,2],[2,4],[6,7]]}' },
    { label: 'Own case 2', input: '{"nums":[6,3,5,7,7,4],"queries":[[13,5],[9,2],[7,4]]}' },
  { label: 'Single number', input: '{"nums":[7],"queries":[[7,10]]}' },
  { label: 'No value under the limit', input: '{"nums":[8,9],"queries":[[3,2]]}' },
  { label: 'Equal numbers', input: '{"nums":[4,4,4],"queries":[[4,4]]}' },
  { label: 'Long run: 10 numbers', input: '{"nums":[27,3,19,26,1,29,3,15,27,20],"queries":[[9,22],[3,19],[23,4],[4,8],[2,11],[6,9]]}' },
  ],
}

export default function MaxXorWithElement() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const m = step.m
    return <>
      <IndexedSequence label="nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]}
        roleAt={index => (run.input.nums[index] === step.chosen ? 'match' : m !== null && run.input.nums[index] > m ? 'blocked' : '')} />
      <table aria-label="Bit walk for this query" style={{ borderCollapse: 'collapse', color: 'var(--text)', margin: '0.5rem 0' }}>
        <thead><tr><th>bit</th><th>x bit</th><th>wanted bit</th><th>taken</th></tr></thead>
        <tbody>{(step.walk || []).map(w => <tr key={w.bit}>
          <td>{w.bit}</td><td>{w.xBit}</td><td>{w.want}</td>
          <td>{w.ok ? 'wanted: a value at most m exists below' : 'other: the wanted branch has nothing at most m'}</td>
        </tr>)}</tbody>
      </table>
      <output aria-label="Query">{step.x === null ? 'Waiting for a query' : `Query x = ${step.x}, limit m = ${step.m}`}</output>
      <output aria-label="Answers so far">{`Answers so far: [${step.answers.join(', ')}]`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each trie node stores the smallest number in its subtree. A branch with a smallest value above m holds no usable number, so the query skips it.</p>
    <p>Greedy choice from the top bit: take the opposite bit whenever a usable number exists down that branch, which maximises the xor bit by bit.</p>
  </>} />
}
