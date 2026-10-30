import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { code, python, parseInput, buildTrace } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the single letter a.' },
    { id: 'check', label: 'Check length', description: 'Compare the current length with k.' },
    { id: 'shift', label: 'Shift', description: 'Build the shifted copy.' },
    { id: 'append', label: 'Append', description: 'Append the copy to the word.' },
    { id: 'done', label: 'Result', description: 'Read the k-th character.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'k (JSON object)',
  url: 'https://leetcode.com/problems/find-the-k-th-character-in-string-game-i/',
  complexity: 'O(k) time and O(k) space for the built prefix. The visualization caps k at 500.',
  examples: [
    { label: 'Example 1', input: '{"k": 5}' },
    { label: 'Example 2', input: '{"k": 10}' },
  ],
}

export default function KthCharacterGameOneVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label="Built word" length={step.word.length} active={step.active}
            valueAt={i => step.word[i]}
            roleAt={i => (step.phase === 'append' && i >= step.word.length - (step.word.length / 2) ? 'appended' : '')} />
          <output aria-label="Current k-th character">{step.phase === 'done' ? `Answer: ${step.result}` : `Length ${step.length} of k = ${run.input.k}`}</output>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.explanation}</p>}
    />
  )
}
