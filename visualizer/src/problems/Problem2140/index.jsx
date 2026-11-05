import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2140',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Questions as a JSON array of [points, brainpower]',
  url: 'https://leetcode.com/problems/solving-questions-with-brainpower/',
  complexity: 'O(n) time and O(n) space for the best-from-here table.',
  examples: [
    { label: 'Skip to save a big one', input: '[[5,1],[1,1],[9,2]]' },
    { label: 'Chain of small ones', input: '[[1,1],[2,0],[3,1],[4,0]]' },
  ],
}

export default function Problem2140Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label="Best points from question i onward (filled right to left)" length={run.input.questions.length + 1} valueAt={i => step.best[i]} active={step.i} roleAt={i => (i === step.next ? 'solve jumps here' : i === step.i + 1 && step.i < run.input.questions.length ? 'skip goes here' : '')} />
          <p>{step.choice ? `Best choice here: ${step.choice}` : ''}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
