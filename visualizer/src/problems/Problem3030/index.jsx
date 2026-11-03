import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RegionAverageView from './RegionAverageView'
import { buildTrace, parseInput, code, python } from './algorithm'
import './RegionAverageView.css'

const definition = {
  phases: [
    { id: 'start', label: 'Scan', description: 'List every 3 by 3 window.' },
    { id: 'window', label: 'Window', description: 'Pick the next window.' },
    { id: 'pair', label: 'Neighbours', description: 'Compare an adjacent pair inside the window.' },
    { id: 'reject', label: 'Reject', description: 'One pair is too far apart, so the window is skipped.' },
    { id: 'mean', label: 'Mean', description: 'Floor the mean of a valid window.' },
    { id: 'cover', label: 'Cover', description: 'Add that mean to the pixels it covers.' },
    { id: 'pixel', label: 'Pixel', description: 'Finish each pixel with its floored average.' },
    { id: 'done', label: 'Result', description: 'Return the new grid.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with image (rows of intensities) and threshold',
  url: 'https://leetcode.com/problems/find-the-grid-of-region-average/',
  complexity: 'O(m * n) time and space for an m by n image, with a fixed 3 by 3 window. The visualization caps the image at 6 by 6.',
  examples: [
    { label: 'Flat block and a step', input: '{"image":[[1,2,3,8],[2,3,4,9],[3,4,5,10],[4,5,6,11]],"threshold":2}' },
    { label: 'Two plateaus', input: '{"image":[[40,40,40],[40,40,40],[40,40,40],[90,90,90],[90,90,90]],"threshold":0}' },
    { label: 'Ramp within threshold', input: '{"image":[[0,50,100],[0,50,100],[0,50,100]],"threshold":60}' },
  ],
}

export default function FindTheGridOfRegionAverage() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <RegionAverageView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Both averaging stages floor their result, and a window only counts when all of its internal neighbour pairs are within the threshold.</p>
    </>} />
}
