import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Scan', description: 'Look for unseen land.' },
    { id: 'explore', label: 'Walk island', description: 'Record each step and each step back.' },
    { id: 'new', label: 'New shape', description: 'This walk has not appeared before.' },
    { id: 'repeat', label: 'Repeat shape', description: 'This walk matches an island already counted.' },
    { id: 'done', label: 'Complete', description: 'Count the distinct walks.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Grid (JSON array of 0/1 strings)',
  url: 'https://leetcode.com/problems/number-of-distinct-islands/',
  complexity: 'O(rows * columns) time and space. The visualization caps the grid at 10 by 10.',
  examples: [
    { label: 'Two shapes', input: '["11000","10000","00011","00001"]' },
    { label: 'Mirror image', input: '["110","100","000","011","001"]' },
  ],
}

export default function NumberOfDistinctIslands() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DPTable title="Grid (island highlighted)" values={run.grid} activeCell={step.cell} relatedCells={step.island} />
    <output aria-label="Shapes">{`Distinct shapes so far: ${step.shapes}${step.shape ? `, walk ${step.shape}` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>Islands are compared by shape alone, so a translated island matches. Starting each walk from the island’s first cell in scan order gives the same walk for the same shape.</p>
    <p>A mirrored island takes its steps in the opposite order, so its walk differs and it is counted separately.</p>
  </>} />
}
