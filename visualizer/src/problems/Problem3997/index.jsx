import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import TreeMaxView from './TreeMaxView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '3997',
  phases: [
    { id: 'start', label: 'Setup', description: 'Prepare the subtree maxima and the count.' },
    { id: 'node', label: 'Node', description: 'Combine a node with its children and test it.' },
    { id: 'done', label: 'Result', description: 'Report the dominant node count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Level-order array of a complete tree (e.g. [4,6,2,3,1,5,7])',
  url: 'https://leetcode.com/problems/count-dominant-nodes-in-a-binary-tree/',
  complexity: 'O(n) time and O(n) space for n nodes. The visualization caps the tree at 15 nodes.',
  examples: [
    { label: 'Mixed tree', input: '[4,6,2,3,1,5,7]' },
    { label: 'Equal values', input: '[9,9,9]' },
  ],
}

export default function CountDominantNodes() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <TreeMaxView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Children are processed before parents because the heap indexing puts every child after its parent.</p>
    </>} />
}
