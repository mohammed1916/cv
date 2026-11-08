import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2110',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Prices as a JSON array (e.g. [3,2,1,4])',
  url: 'https://leetcode.com/problems/number-of-smooth-descent-periods-of-a-stock/',
  complexity: 'O(n) time and O(1) extra space; the visualization keeps the run length of every day.',
  examples: [
    { label: 'One long run', input: '[9,8,7,4,3]' },
    { label: 'Two runs', input: '[5,4,4,3,2]' },
    { label: 'Rise breaks it', input: '[6,5,7,6]' }, { label: "Single price", input: "[1]" }, { label: "Equal prices", input: "[5,5,5]" }, { label: "Extreme prices", input: "[100,1,100,1]" }, { label: "Long run: 40 prices", input: "[30,8,92,43,56,76,19,74,69,16,43,63,59,72,61,31,60,75,40,90,60,73,13,55,52,22,11,52,57,96,52,85,60,77,65,52,41,31,21,95]" },
  ],
}

export default function Problem2110Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label="Prices" length={run.input.prices.length} valueAt={i => run.input.prices[i]} active={step.i} roleAt={i => (step.marks[i] ? 'today' : '')} />
          <IndexedSequence label="Run length ending on each day" length={step.runs.length} valueAt={i => step.runs[i]} active={step.runs.length - 1} roleAt={() => ''} />
          <p>Periods so far: {step.total}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
