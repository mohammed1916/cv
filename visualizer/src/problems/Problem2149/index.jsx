import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2149',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Equal positives and negatives as a JSON array',
  url: 'https://leetcode.com/problems/rearrange-array-elements-by-sign/',
  complexity: 'O(n) time and O(n) space for the output.',
  examples: [
    { label: 'Positives first', input: '[7,-4,2,-9,5,-1]' },
    { label: 'Negatives first', input: '[-3,6,-8,4]' },
    { label: 'Single pair', input: '[1,-1]' },
    { label: 'Repeated magnitudes', input: '[5,-5,5,-5]' },
    { label: 'Largest magnitude', input: '[100000,-100000]' },
    { label: 'Long run: 40 values', input: '[56948,-50086,36337,-28018,-496,-276,92768,-72630,20266,83355,-90250,53722,66374,-80776,53856,-71288,-60835,70026,95215,-60827,98252,-74834,-17397,-61225,72789,21636,-85446,20582,-10101,49830,-57197,99637,40585,-51230,7108,45132,42090,-72698,-97354,-20761]' },
  ],
}

export default function Problem2149Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label="Input (current value highlighted)" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.i} roleAt={() => ''} />
          <IndexedSequence label="Output (p writes even slots, q writes odd slots)" length={step.result.length} valueAt={i => (step.result[i] === null ? '·' : step.result[i])} active={-1} roleAt={i => (i === step.p ? 'p' : i === step.q ? 'q' : '')} />
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
