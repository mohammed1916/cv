import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sorted', description: 'Smaller values are processed first.' },
    { id: 'pairs', label: 'Factor pairs', description: 'Each pair of factors adds its product of tree counts.' },
    { id: 'leaf', label: 'Leaf only', description: 'No pair of factors means only the single-node tree.' },
    { id: 'done', label: 'Complete', description: 'Add the tree counts for every root.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'arr (JSON object with distinct integers)',
  url: 'https://leetcode.com/problems/binary-trees-with-factors/',
  complexity: 'O(n^2) time and O(n) space.',
  examples: [
    { label: 'Three roots', input: '{"arr":[3,6,9,18]}' },
    { label: 'Chain', input: '{"arr":[2,3,6,12,36]}' },
  ],
}

export default function BinaryTreesWithFactors() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <RecordStateTable label="Roots processed in order" columns={['root', 'factor pairs', 'trees rooted here']}
      rows={step.rows.map(r => ({ root: r.value, 'factor pairs': r.pairs, 'trees rooted here': r.trees }))}
      activeRow={step.rows.length - 1} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A tree rooted at x has children whose values multiply to x. Each pair of factors a and x/a, both present, contributes the product of their tree counts.</p>
    <p>Processing values in increasing order means each child count is ready before it is used.</p>
  </>} />
}
