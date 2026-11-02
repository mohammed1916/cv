import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the best count to zero.' },
    { id: 'target', label: 'Target', description: 'Every operation must score this total.' },
    { id: 'front', label: 'Front', description: 'Remove the two numbers at the front.' },
    { id: 'back', label: 'Back', description: 'Remove the two numbers at the back.' },
    { id: 'ends', label: 'Ends', description: 'Remove one number from each end.' },
    { id: 'memo', label: 'Memo', description: 'This interval was already solved.' },
    { id: 'best', label: 'Best', description: 'Keep the largest count across targets.' },
    { id: 'done', label: 'Result', description: 'The maximum number of operations.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of 2 to 10 integers from 1 to 20',
  url: 'https://leetcode.com/problems/maximum-number-of-operations-with-the-same-score-ii/',
  complexity: 'O(n^2) states for each of three target scores, each with three moves. The trace caps n at 10.',
  examples: [
    { label: 'Example 1', input: '[3,2,1,2,3,4]' },
    { label: 'Example 2', input: '[3,2,6,1,4]' },
  ],
}

export default function SameScoreII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.length} valueAt={i => run.input[i]} active={step.l ?? -1}
      roleAt={i => (step.l !== null && step.r !== null && i >= step.l && i <= step.r ? 'window' : '')} />
    <output aria-label="Interval and target">{`interval ${step.l ?? '-'} to ${step.r ?? '-'}, target ${step.target ?? '-'}, best ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>The first removal fixes the score for every later removal. Each remaining part is a contiguous interval, so storing the answer for each interval avoids repeated work.</p>
    <p>Three possible removals exist at each step: the two front values, the two back values, or one value from each end.</p>
  </>} />
}
