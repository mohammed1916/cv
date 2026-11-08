import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no rows.' },
    { id: 'row', label: 'Row', description: 'This row fits the balls left.' },
    { id: 'stop', label: 'Stop', description: 'The next row needs more balls than remain.' },
    { id: 'done', label: 'Result', description: 'The tallest triangle over both starting colors.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with red and blue ball counts (0 to 100)',
  url: 'https://leetcode.com/problems/maximum-height-of-a-triangle/',
  complexity: 'O(h) time, where h is the height reached, for each starting color.',
  examples: [
    { label: 'Own case 1', input: '{"red":3,"blue":5}' },
    { label: 'Own case 2', input: '{"red":3,"blue":2}' },
    { label: 'Own case 3', input: '{"red":2,"blue":2}' },
    { label: 'Own case 4', input: '{"red":11,"blue":2}' },
    { label: 'Both empty', input: '{"red":0,"blue":0}' },
    { label: 'Only blue', input: '{"red":0,"blue":5}' },
    { label: 'Maximum counts', input: '{"red":100,"blue":100}' },
    { label: 'Long run: 197 total', input: '{"red":97,"blue":100}' },
  ],
}

export default function MaximumHeightTriangle() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Current start">{step.first ? `starting with ${step.first}` : 'choosing a start'}</output>
    <output aria-label="Height">{`height ${step.height}, used red ${step.usedA ?? '-'} and blue ${step.usedB ?? '-'}, best ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>Row r has r balls, all of one colour, and adjacent rows differ. Odd rows take the chosen starting colour and even rows take the other, so each row is paid from that colour's remaining balls.</p>
    <p>Trying both starting colors and growing the triangle while the totals fit gives the answer.</p>
  </>} />
}
