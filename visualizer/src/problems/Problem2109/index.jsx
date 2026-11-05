import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2109',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with s and spaces',
  url: 'https://leetcode.com/problems/adding-spaces-to-a-string/',
  complexity: 'O(n + m) time for a string of length n and m insert positions; the output string is built once.',
  examples: [
    { label: 'Two spaces', input: '{"s":"Greenhouse","spaces":[5]}' },
    { label: 'Start and end cuts', input: '{"s":"abcdef","spaces":[0,3]}' },
    { label: 'Single gap', input: '{"s":"Hello","spaces":[2]}' },
  ],
}

export default function Problem2109Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label="String s (the highlighted cut is the next space position)" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.r >= 0 ? step.r : -1} roleAt={i => (i === step.l ? 'from' : i === step.r ? 'space' : '')} />
          <p>Built so far: <code>{step.built}</code></p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
