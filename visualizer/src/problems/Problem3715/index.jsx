import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, squareFreePart } from './algorithm'

const definition = {
  phases: [
    { id: 'walk', label: 'Walk', description: 'Visit nodes from the root, counting matching ancestors.' },
    { id: 'done', label: 'Result', description: 'The total of all counts.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, edges and nums',
  url: 'https://leetcode.com/problems/sum-of-perfect-square-ancestors/',
  complexity: 'O(n * sqrt(max value)) for the square-free parts plus O(n) for the tree walk.',
  examples: [
    { label: 'Example', input: '{"n":4,"edges":[[0,1],[0,2],[2,3]],"nums":[3,12,27,3]}' },
    { label: 'Path', input: '{"n":3,"edges":[[0,1],[1,2]],"nums":[5,20,7]}' },
  ],
}

export default function SumOfPerfectSquareAncestors() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="square-free part by node" length={run.input.n} valueAt={i => squareFreePart(run.input.nums[i])} active={step.node}
      roleAt={i => (i === 0 ? 'root' : '')} />
    <output aria-label="Node count">{step.node < 0 ? `total ${step.total}` : step.node === 0 ? 'root has no ancestors' : `node ${step.node}: ${step.t} matching ancestor${step.t === 1 ? '' : 's'}; total ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Two positive integers multiply to a perfect square exactly when they have the same square-free part, which is the product of primes that appear an odd number of times.</p>
    <p>During a walk from the root, a count per square-free part tells how many ancestors match the current node.</p>
  </>} />
}
