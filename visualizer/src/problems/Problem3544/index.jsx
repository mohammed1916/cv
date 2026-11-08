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
    { label: 'Path with a branch', input: '{"edges":[[0,1],[1,2],[1,3],[3,4]],"nums":[2,-3,5,1,-4],"k":2}' },
    { label: 'Middle node negative', input: '{"edges":[[1,0],[1,2]],"nums":[1,-5,3],"k":2}' },
    { label: 'Two nodes', input: '{"edges":[[0,1]],"nums":[0,5],"k":1}' },
    { label: 'Equal values', input: '{"edges":[[0,1],[0,2]],"nums":[3,3,3],"k":2}' },
    { label: 'Extreme values', input: '{"edges":[[0,1],[1,2],[2,3]],"nums":[20,-20,20,-20],"k":6}' },
    { label: 'Long run: 12 nodes', input: '{"edges":[[0,1],[1,2],[2,3],[3,4],[4,5],[2,6],[2,7],[2,8],[4,9],[9,10],[7,11]],"nums":[-16,9,2,3,12,8,11,14,-14,13,-13,-4],"k":3}' },
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
