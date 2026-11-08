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
    { label: 'Own: four nodes, two queries', input: '{"par":[-1,0,1,1],"vals":[3,0,5,2],"queries":[[3,1],[2,2]]}' },
    { label: 'Own: four nodes, k up to n', input: '{"par":[-1,0,0,2],"vals":[4,9,1,6],"queries":[[3,2],[0,4]]}' },
    { label: 'Single node, value zero', input: '{"par":[-1],"vals":[0],"queries":[[0,1]]}' },
    { label: 'Equal values under one root', input: '{"par":[-1,0,0],"vals":[3,3,3],"queries":[[0,2],[0,3]]}' },
    { label: 'Largest values on a chain', input: '{"par":[-1,0,1,2,3],"vals":[15,15,15,15,15],"queries":[[0,5],[4,1]]}' },
    { label: 'Long run: 8 nodes', input: '{"par":[-1,0,1,0,2,1,4,6],"vals":[14,2,7,8,1,2,0,11],"queries":[[3,2],[1,7],[1,2],[0,6],[6,1],[0,5]]}' },
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
