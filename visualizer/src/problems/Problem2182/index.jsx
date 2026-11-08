import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LetterView from './LetterView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2182',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON with s and limit, e.g. {"s":"cczazcc","limit":3}',
  url: 'https://leetcode.com/problems/construct-string-with-repeat-limit/',
  complexity: 'O(n + 26) time and O(26) extra space for the letter counts. The visualization caps s at 24 letters and limit at 6.',
  examples: [
    { label: 'Mixed letters', input: '{"s":"cczazcc","limit":3}' },
    { label: 'Two letters', input: '{"s":"aababab","limit":2}' },
    { label: 'All distinct', input: '{"s":"abc","limit":1}' },
    { label: 'Single letter', input: '{"s":"a","limit":1}' },
    { label: 'Limit one, separator missing', input: '{"s":"aaa","limit":1}' },
    { label: 'Largest string, limit six', input: '{"s":"zzzzyyyyxxxxwwwwvvvvuuuu","limit":6}' },
    { label: 'Long run: 24 letters', input: '{"s":"fbghgahcgdeghdahghbagcbh","limit":4}' },
  ],
}

export default function Problem2182Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <LetterView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
