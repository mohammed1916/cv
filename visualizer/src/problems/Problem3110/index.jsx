import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with a score of zero.' },
    { id: 'pair', label: 'Pair', description: 'Add the gap between this letter and the next one.' },
    { id: 'done', label: 'Complete', description: 'Report the total score.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'String (JSON object with s)',
  url: 'https://leetcode.com/problems/score-of-a-string/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps input at 30 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"hello"}' },
    { label: 'Example 2', input: '{"s":"zaz"}' },
  ],
}

export default function ScoreOfAString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="String" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.index}
      roleAt={i => (step.index >= 0 && (i === step.index || i === step.index + 1) ? 'pair' : '')} />
    <output aria-label="Running score">{`Gap: ${step.gap}, score: ${step.score}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The score adds the distance between each neighboring pair, so the order of the two letters does not matter.</p>
  </>} />
}
