import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Total', description: 'Check that the whole product equals target squared.' },
    { id: 'try', label: 'Try a subset', description: 'Test whether this subset multiplies to the target.' },
    { id: 'found', label: 'Found', description: 'A subset with product target has been found.' },
    { id: 'done', label: 'Complete', description: 'Report whether a split exists.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and target (JSON)',
  url: 'https://leetcode.com/problems/partition-array-into-two-equal-product-subsets/',
  complexity: 'O(2^n * n) time for n elements. The visualization caps n at 8.',
  examples: [
    { label: 'Own case 1', input: '{"nums":[4,2,7,9,5],"target":25}' },
    { label: 'Own case 2', input: '{"nums":[3,6,4,8],"target":16}' },
    { label: 'Three numbers', input: '{"nums":[1,2,3],"target":6}' },
    { label: 'Smallest target', input: '{"nums":[5,9,12],"target":1}' },
    { label: 'Largest target', input: '{"nums":[100,99,98],"target":10000000000}' },
    { label: 'Long run: 8 numbers', input: '{"nums":[87,64,9,30,10,7,35,38],"target":1000}' },
  ],
}

export default function EqualProductSubsets() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Elements" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={-1}
      roleAt={i => (step.mask !== null && (step.mask >> i) & 1 ? 'in-group' : '')} />
    <output aria-label="Subset">{step.mask === null ? 'No subset chosen' : `Subset mask ${step.mask}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Every element must go to one of the two groups, so if the groups multiply to the target the whole product is the target squared.</p>
  </>} />
}
