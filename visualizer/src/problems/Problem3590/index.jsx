import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Path XOR', description: 'Compute the XOR of the values from the root to each node.' },
    { id: 'query', label: 'Query', description: 'Collect the subtree, sort its distinct path XORs, and read the k-th.' },
    { id: 'done', label: 'Complete', description: 'All queries are answered.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with par, vals and queries (JSON)',
  url: 'https://leetcode.com/problems/kth-smallest-path-xor-sum/',
  complexity: 'O(q * n log n) with this direct form. The visualization caps n at 8 and q at 6.',
  examples: [
    { label: 'Example 1', input: '{"par":[-1,0,0],"vals":[1,1,1],"queries":[[0,1],[0,2],[0,3]]}' },
    { label: 'Example 2', input: '{"par":[-1,0,1],"vals":[5,2,7],"queries":[[0,1],[1,2],[1,3],[2,1]]}' },
  ],
}

export default function KthSmallestPathXor() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Node values" length={run.input.vals.length} valueAt={i => run.input.vals[i]} active={step.query ? step.query[0] : -1} />
    <output aria-label="Answer">{step.query ? `Query ${step.query[0]}, k = ${step.query[1]}: ${step.answer}` : 'Choose a query'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>XOR-ing along the root path means each node's value depends only on its path, so the subtree answer is a sorted list of distinct numbers.</p>
  </>} />
}
