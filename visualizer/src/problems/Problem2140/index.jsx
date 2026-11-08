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
    { label: 'Single question', input: '[[7,0]]' },
    { label: 'Equal questions', input: '[[4,1],[4,1]]' },
    { label: 'Largest points', input: '[[100000,0],[100000,30]]' },
    { label: 'Long run: 30 questions', input: '[[6216,30],[20545,8],[68565,22],[62849,25],[42879,17],[6787,26],[39264,1],[64962,22],[81236,7],[82843,30],[65017,22],[80682,27],[585,1],[96363,13],[36897,21],[45817,19],[67997,18],[85393,20],[42680,29],[80175,12],[83279,10],[89199,12],[22334,9],[684,14],[20929,1],[11779,22],[57204,2],[34032,14],[95666,29],[21615,24]]' },
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
