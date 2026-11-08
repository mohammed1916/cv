import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RootedTreeDiagram from '../../components/shared/RootedTreeDiagram'
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
    { label: 'Example', input: '{"n":4,"edges":[[0,3],[3,1],[0,2]],"nums":[2,8,2,18]}' },
    { label: 'Path', input: '{"n":3,"edges":[[0,2],[2,1]],"nums":[8,2,18]}' },
    { label: 'Single node', input: '{"n":1,"edges":[],"nums":[7]}' },
    { label: 'Equal values star', input: '{"n":4,"edges":[[0,1],[0,2],[0,3]],"nums":[5,5,5,5]}' },
    { label: 'Path of 20 nodes', input: '{"n":20,"edges":[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15],[15,16],[16,17],[17,18],[18,19]],"nums":[303,86,129,552,267,50,989,860,519,806,897,296,459,890,773,588,255,494,409,136]}' },
    { label: 'Long run: random tree of 20 nodes', input: '{"n":20,"edges":[[0,1],[0,2],[1,3],[2,4],[2,5],[0,6],[4,7],[6,8],[6,9],[8,10],[1,11],[2,12],[1,13],[0,14],[5,15],[6,16],[14,17],[2,18],[7,19]],"nums":[928,611,426,957,284,471,182,721,232,811,410,477,324,215,582,721,624,699,962,77]}' },
  ],
}

export default function SumOfPerfectSquareAncestors() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    if (step.node >= 0) {
      step.path.forEach(a => { roles[a] = 'best' })
      step.matches.forEach(a => { roles[a] = 'target' })
      roles[step.node] = 'focus'
    }
    return <>
      <RootedTreeDiagram root={run.tree} roles={roles} title="Tree from node 0" />
      <IndexedSequence label="square-free part by node" length={run.input.n} valueAt={i => squareFreePart(run.input.nums[i])} active={step.node}
        roleAt={i => (step.node >= 0 && i === step.node ? 'focus' : (step.matches && step.matches.includes(i) ? 'match' : ''))} />
      <output aria-label="Node count">{step.node < 0 ? `total ${step.total}` : step.node === 0 ? 'root has no ancestors' : `node ${step.node}: ${step.t} matching ancestor${step.t === 1 ? '' : 's'}; total ${step.total}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Two positive integers multiply to a perfect square exactly when they have the same square-free part, which is the product of primes that appear an odd number of times.</p>
    <p>During a walk from the root, a count per square-free part tells how many ancestors match the current node. The highlighted path is the set of ancestors being counted.</p>
  </>} />
}
