import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2155',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Binary array as JSON (e.g. [0,0,1,0])',
  url: 'https://leetcode.com/problems/all-divisions-with-the-highest-score-of-a-binary-array/',
  complexity: 'O(n) time with running counts; O(n) space for the scores shown.',
  examples: [
    { label: 'Two best divisions', input: '[0,0,1,0]' },
    { label: 'All ones', input: '[1,1,1]' },
  ],
}

export default function Problem2155Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label={`Array (split after position ${step.split ?? '–'} is shown in the score)`} length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.split === null ? -1 : step.split - 1} roleAt={i => (step.split !== null && i < step.split ? 'left' : 'right')} />
          <IndexedSequence label="Score of each division" length={step.scores.length} valueAt={i => step.scores[i]} active={step.i} roleAt={i => (step.result.includes(i) ? 'best' : '')} />
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
