import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Digits', description: 'Collect the digits the clock already shows.' },
    { id: 'candidate', label: 'Try a time', description: 'Build a valid arrangement and measure the wait until it.' },
    { id: 'done', label: 'Complete', description: 'Report the arrangement with the shortest wait.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Time (JSON string, HH:MM)',
  url: 'https://leetcode.com/problems/next-closest-time/',
  complexity: 'O(1) time: at most 4 to the power 4 arrangements of four digits.',
  examples: [
    { label: 'Example 1', input: '"19:34"' },
    { label: 'Wraps midnight', input: '"23:59"' },
  ],
}

export default function NextClosestTime() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Allowed digits" length={step.digits.length} valueAt={i => step.digits[i]} />
    <output aria-label="Candidate">
      {step.candidate === null ? 'No candidate yet' : `Candidate ${step.candidate}${step.gap === null ? '' : `, ${step.gap} minutes ahead`}`}
      {step.best !== null && `. Best so far: ${step.best}`}
    </output>
  </>} renderReasoning={() => <>
    <p>Only the four digits on the clock can be used, and each may be reused. There are at most 256 arrangements, so trying them all is simple.</p>
    <p>A time earlier than the current one is the next day’s time, so the wait is measured modulo a day.</p>
  </>} />
}
