import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import FixedRatioView from './FixedRatioView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2489',
  phases: [
    { id: 'start', label: 'Start', description: 'Count the empty prefix once.' },
    { id: 'step', label: 'Read', description: 'Move the running key with one character.' },
    { id: 'count', label: 'Count', description: 'Add the earlier prefixes with the same key.' },
    { id: 'store', label: 'Store', description: 'Record this key for later positions.' },
    { id: 'done', label: 'Result', description: 'Report the number of substrings.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with s, num1 and num2 (binary s, positive ratio parts)',
  url: 'https://leetcode.com/problems/number-of-substrings-with-fixed-ratio/',
  complexity: 'O(n) expected time and O(n) space for a binary string of length n, using a hash map of prefix keys. The visualization caps s at 40 characters and each ratio part at 9; the official limits are larger. The statement is taken as zeros : ones = num1 : num2.',
  examples: [
    { label: 'Two zeros per one', input: '{"s":"1001101","num1":2,"num2":1}' },
    { label: 'Balanced pairs', input: '{"s":"0011101","num1":2,"num2":3}' },
    { label: 'No zeros', input: '{"s":"1111","num1":1,"num2":1}' },
  ],
}

export default function NumberOfSubstringsWithFixedRatio() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <FixedRatioView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message} Two prefixes with the same key enclose a substring whose zeros and ones keep the ratio.</p>}
    />
  )
}
