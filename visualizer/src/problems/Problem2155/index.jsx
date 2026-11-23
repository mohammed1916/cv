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
  question: "Return every split index of a binary array that gives the highest score, where a split's score is zeros before it plus ones from it onward.",
  approaches: [
    { name: "Running counts", intuition: "Walk the split index from left to right, updating the zero and one counts, and keep the splits with the best score.", time: "O(n)", space: "O(1) extra" },
  ],
  examples: [
    { label: 'Two best divisions', input: '[0,0,1,0]' },
    { label: 'All ones', input: '[1,1,1]' },
    { label: 'Single zero', input: '[0]' },
    { label: 'Every division ties', input: '[0,1]' },
    { label: 'Largest input, all zeros', input: '[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]' },
    { label: 'Long run: 40 values', input: '[1,0,1,0,0,1,0,1,1,0,1,1,0,1,1,0,0,1,0,1,0,0,1,1,1,0,0,0,0,1,1,0,0,1,0,0,0,0,1,1]' },
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
