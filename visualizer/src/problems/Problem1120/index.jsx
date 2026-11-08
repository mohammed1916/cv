import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import TreeAverageView from './TreeAverageView'
import { buildTrace, parseInput, code, python } from './algorithm'
import './TreeAverageView.css'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin the recursive visit at the root.' },
    { id: 'enter', label: 'Descend', description: 'Enter a node and visit its children first.' },
    { id: 'combine', label: 'Combine', description: 'Add the node value to both child sums and sizes.' },
    { id: 'average', label: 'Average', description: 'Divide the subtree total by its node count.' },
    { id: 'update', label: 'New best', description: 'This subtree average beats the best so far.' },
    { id: 'keep', label: 'Keep best', description: 'This subtree average does not beat the best.' },
    { id: 'done', label: 'Result', description: 'Report the largest subtree average.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Level-order array with null for missing nodes (e.g. [4, 8, 5, 0, 1, null, 6])',
  url: 'https://leetcode.com/problems/maximum-average-subtree/',
  complexity: 'O(n) time and O(h) recursion space for n nodes and height h. Each node is visited once, and the answer is accepted within an absolute error of 1e-5. The visualization caps the tree at 30 nodes; the official limit is 5,000 nodes with values up to 10^5. The official bounds and tolerance were not verified against the source page.',
  examples: [
    { label: 'Mixed tree', input: '[7, 2, 9, null, 4, 1]' },
    { label: 'Single node', input: '[3]' },
    { label: 'Zero-heavy tree', input: '[2, 0, 6, 0, 0, 5, 8]' },
    { label: 'Root only, zero value', input: '[0]' },
    { label: 'Equal values', input: '[5, 5, 5]' },
    { label: 'Long run: 30 entries', input: '[17303,23359,2420,26434,30257,25269,null,29535,12172,24414,7822,1350,1889,null,28925,86,29143,15755,9002,12007,null,7690,663,22796,29070,4185,6756,null,29140,25391]' },
  ],
}

export default function MaximumAverageSubtree() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <TreeAverageView run={run} step={step} />}
    renderReasoning={({ step }) => <p>{step.message}</p>} />
}
