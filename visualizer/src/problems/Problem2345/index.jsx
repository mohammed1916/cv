import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MountainView from './MountainView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Intervals', description: 'Turn each peak into its ground interval.' },
    { id: 'pick', label: 'Pick', description: 'Choose the mountain to test.' },
    { id: 'compare', label: 'Compare', description: 'Ask whether another interval contains this one.' },
    { id: 'hidden', label: 'Hidden', description: 'Another mountain covers this peak.' },
    { id: 'visible', label: 'Visible', description: 'No mountain covers this peak.' },
    { id: 'done', label: 'Result', description: 'Report the visible count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'List of [x, y] peaks (e.g. [[2,2],[2,2],[3,2]])',
  url: 'https://leetcode.com/problems/finding-the-number-of-visible-mountains/',
  complexity: 'O(n^2) time and O(n) space for this teaching trace, which tests every pair. Sorting the intervals gives an O(n log n) sweep. The visualization caps the input at 10 peaks with x up to 40 and y up to 20.',
  examples: [
    { label: 'Twin peaks', input: '[[4,3],[1,1],[9,4],[4,1]]' },
    { label: 'Identical pair', input: '[[2,2],[2,2],[3,2]]' },
    { label: 'Lone peak', input: '[[5,5]]' },
    { label: 'Three identical peaks', input: '[[7,3],[7,3],[7,3]]' },
    { label: 'Tall peak at the left edge', input: '[[0,20],[0,1],[40,1]]' },
    { label: 'Largest count: 10 peaks', input: '[[0,1],[4,2],[8,3],[12,4],[16,5],[20,6],[24,7],[28,8],[32,9],[36,10]]' },
    { label: 'Long run: 10 random peaks', input: '[[5,20],[18,10],[10,1],[5,1],[18,6],[32,13],[14,18],[17,11],[35,20],[23,3]]' },
  ],
}

export default function FindingVisibleMountains() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <MountainView run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A mountain is covered when another ground interval contains its interval, so the peak sits under that slope or on its boundary. Two identical peaks cover each other, so neither counts.</p>
  </>} />
}
