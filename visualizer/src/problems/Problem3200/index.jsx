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
    { label: 'Example 1', input: '{"red":2,"blue":4}' },
    { label: 'Example 2', input: '{"red":2,"blue":1}' },
    { label: 'Example 3', input: '{"red":1,"blue":1}' },
    { label: 'Example 4', input: '{"red":10,"blue":1}' },
  ],
}

export default function MaximumHeightTriangle() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Current start">{step.first ? `starting with ${step.first}` : 'choosing a start'}</output>
    <output aria-label="Height">{`height ${step.height}, used red ${step.usedA ?? '-'} and blue ${step.usedB ?? '-'}, best ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>Row r has r balls, and its colors alternate. Odd rows start with the chosen color, so that color covers one more ball than the other in those rows.</p>
    <p>Trying both starting colors and growing the triangle while the totals fit gives the answer.</p>
  </>} />
}
