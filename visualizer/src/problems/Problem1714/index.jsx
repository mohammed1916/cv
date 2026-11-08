import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SpacedSumView from './SpacedSumView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1714',
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and queries ([start, step] pairs)',
  url: 'https://leetcode.com/problems/sum-of-special-evenly-spaced-elements-in-array/',
  complexity: 'Each query walks its stride, so one query costs O(n / step) and q queries cost O(q * n) in this direct form. The visualization caps nums at 12 values. Sums are reduced modulo 1000000007 only when stored.',
  examples: [
    { label: 'Mixed strides', input: '{"nums":[4,8,1,9,3,6],"queries":[[0,2],[1,3],[5,1]]}' },
    { label: 'Single element', input: '{"nums":[7],"queries":[[0,1]]}' },
  { label: 'Single step', input: '{"nums":[3,5],"queries":[[0,1]]}' },
  { label: 'Step equals length', input: '{"nums":[2,4,6],"queries":[[1,3]]}' },
  { label: 'Largest values', input: '{"nums":[100,100,100,100],"queries":[[0,12]]}' },
  { label: 'Long run: 12 numbers', input: '{"nums":[90,75,41,11,71,20,14,93,44,4,48,51],"queries":[[11,4],[4,5],[2,5],[1,8],[0,3],[2,2]]}' },
  ],
}

export default function SpacedEvenlySumsVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SpacedSumView run={run} step={step} />}
      renderReasoning={({ step }) => (
        <>
          <p>{step.message}</p>
          <p>Each query starts at its start index and jumps by step, so only the elements it touches are read; the array is never changed.</p>
        </>
      )}
    />
  )
}
