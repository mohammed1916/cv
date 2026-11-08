import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Size the grid', description: 'Height sets the number of rows and the width.' },
    { id: 'place', label: 'Place a node', description: 'A node sits in the middle of its column range.' },
    { id: 'done', label: 'Complete', description: 'The matrix shows every node at its fixed position.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Tree (LeetCode level-order JSON array, up to 127 items)',
  url: 'https://leetcode.com/problems/print-binary-tree/',
  complexity: 'O(n) placements; the matrix has (height + 1) × (2^(height+1) − 1) cells.',
  examples: [
    { label: 'Two levels', input: '[1,2]' },
    { label: 'Three levels', input: '[4,2,7,1,null,6]' },
    { label: 'Chain', input: '[3,null,5,null,9]' },
    { label: 'Single node', input: '[5]' },
    { label: 'Equal values', input: '[3,3,3]' },
    { label: 'Extreme values', input: '[99,-99,99,null,null,-99,99]' },
    { label: 'Long run: 127 nodes', input: '[-97,39,77,-98,-97,-50,-38,39,-59,-99,31,-88,-28,-47,41,-65,-61,56,34,-74,20,-87,-65,43,1,61,77,96,96,17,-52,18,-92,-49,-98,-38,-22,0,-94,-34,-57,-74,41,-14,2,-57,87,33,-7,-72,99,56,87,-32,-50,51,-11,70,-35,92,94,-26,6,-35,7,84,-27,-37,-27,-14,-54,-68,-49,9,-63,38,-16,-38,-96,-33,69,95,-23,-46,15,17,-60,89,68,-93,-39,-11,-38,95,31,-67,24,67,-1,-35,86,-83,-60,1,-76,81,-53,-3,-24,80,50,52,-90,-35,-34,98,-12,-61,68,-26,-82,48,26,-54,33,-36,-84]' },
  ],
}

export default function PrintBinaryTree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <MatrixGrid label={`Layout: ${step.rows} × ${step.cols}`} matrix={step.matrix}
      activeCell={step.cell} highlightedCells={step.cell ? [step.cell] : []} showFlatIndices={false} />
    <output aria-label="Layout size">{`Rows ${step.rows}, columns ${step.cols}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why the middle:</strong> each child takes one half of its parent's column range, so siblings never collide and the empty cells keep the structure visible.</p>
  </>} />
}
