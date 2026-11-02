import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import TallyTreesView from './TallyTreesView'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const definition = {
  number: '1612',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with t1 and t2 (LeetCode level-order arrays of "+" and letters, null for missing children)',
  url: 'https://leetcode.com/problems/check-if-two-expression-trees-are-equivalent/description/',
  complexity: 'O(n) time and O(h + k) space for n tree positions, height h and k distinct letters. The visualization caps each tree at 15 positions; the draft does not verify the official bounds. Equivalence rests on addition being commutative and associative.',
  examples: [
    { label: 'Equivalent', input: '{"t1":["+","+","a","a","b"],"t2":["+","+","a","b","a"]}' },
    { label: 'Different counts', input: '{"t1":["+","+","a","b","b"],"t2":["+","+","a","a","b"]}' },
    { label: 'Single letter', input: '{"t1":["a"],"t2":["a"]}' },
  ],
}

export default function Problem1612Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <TallyTreesView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
