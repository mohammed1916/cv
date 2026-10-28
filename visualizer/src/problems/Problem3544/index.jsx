import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set up the rooted tree and its processing order.' },
    { id: 'node', label: 'Node table', description: 'Fill the best sums for each distance and parity of inverted ancestors.' },
    { id: 'done', label: 'Complete', description: 'Report the best sum at the root.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with edges, nums and k (JSON)',
  url: 'https://leetcode.com/problems/subtree-inversion-sum/',
  complexity: 'O(n * k) time and space. The visualization caps the tree at 12 nodes and k at 6.',
  examples: [
    { label: 'Example 1', input: '{"edges":[[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]],"nums":[4,-8,-6,3,7,-2,5],"k":2}' },
    { label: 'Example 3', input: '{"edges":[[0,1],[0,2]],"nums":[0,-1,-2],"k":3}' },
  ],
}

export default function SubtreeInversionSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Node values" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.node ?? -1}
      roleAt={i => (i === step.node ? 'current' : '')} />
    <output aria-label="Best">{`Best sum at the root: ${step.best === null ? 'not known yet' : step.best}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Inverting a node negates its subtree, so the sign of each value depends on how many chosen nodes sit on its path to the root.</p>
  </>} />
}
