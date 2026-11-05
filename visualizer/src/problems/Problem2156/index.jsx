import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2156',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with s, power, modulo, k and hashValue',
  url: 'https://leetcode.com/problems/find-substring-with-given-hash-value/',
  complexity: 'O(n) time with a rolling hash; O(1) extra space.',
  examples: [
    { label: 'Leftmost match', input: '{"s":"leetcode","power":7,"modulo":20,"k":2,"hashValue":0}' },
    { label: 'Longer window', input: '{"s":"abcdefgh","power":3,"modulo":50,"k":4,"hashValue":21}' },
  ],
}

export default function Problem2156Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label={`String s (window l to r, hash ${step.h}, target ${step.target})`} length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.l} roleAt={i => (i === step.l ? 'l' : i === step.r ? 'r' : i > step.l && i < step.r ? 'in window' : '')} />
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
