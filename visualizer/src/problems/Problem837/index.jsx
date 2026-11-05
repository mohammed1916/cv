import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Score 0', description: 'The window starts with chance 1 at score 0.' },
    { id: 'keep', label: 'Keep drawing', description: 'Scores below k feed the window.' },
    { id: 'win', label: 'Stop and win', description: 'Scores from k to n are final wins.' },
    { id: 'done', label: 'Complete', description: 'Return the total chance.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'n, k and maxPts (JSON object)',
  url: 'https://leetcode.com/problems/new-21-game/',
  complexity: 'O(n) time and O(n) space for the table; the window itself is O(1).',
  examples: [
    { label: 'Wide draws', input: '{"n":12,"k":7,"maxPts":8}' },
    { label: 'Early stop', input: '{"n":6,"k":3,"maxPts":5}' },
  ],
}

export default function New21Game() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label={`Chance of each score (window from ${step.lo} to ${step.hi})`} length={(step.dp ?? [1]).length} active={step.x}
      valueAt={i => (step.dp ? step.dp[i].toFixed(3) : '–')}
      roleAt={i => (i === step.lo ? 'window start' : i === step.hi ? 'window end' : '')} />
    <output aria-label="Window">{`Window sum ${step.windowSum.toFixed(4)} · answer so far ${step.answer.toFixed(4)}`}</output>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Alice draws until her score reaches at least k. Each draw adds a value from 1 to maxPts with equal chance, so a score is the average of the previous maxPts scores that are still below k.</p>
    <p>A sliding window keeps that average in constant time, instead of summing the last maxPts chances each time.</p>
  </>} />
}
