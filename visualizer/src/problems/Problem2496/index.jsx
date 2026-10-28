import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with a best value of zero.' },
    { id: 'value', label: 'Value', description: 'Score this string as a number if it is all digits, or by its length otherwise.' },
    { id: 'better', label: 'New best', description: 'This string has the largest value so far.' },
    { id: 'done', label: 'Complete', description: 'Report the maximum value.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Strings (JSON object with strs)',
  url: 'https://leetcode.com/problems/maximum-value-of-a-string-in-an-array/',
  complexity: 'O(total length) time and O(1) extra space. The visualization caps input at 20 strings.',
  examples: [
    { label: 'Example 1', input: '{"strs":["alic3","bob","3","4","00000"]}' },
    { label: 'Leading zeros', input: '{"strs":["1","01","001","0001"]}' },
  ],
}

export default function MaximumValueOfAString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Strings" length={run.input.strs.length} valueAt={i => run.input.strs[i]} active={step.index}
      roleAt={i => (i < step.index ? 'read' : '')} />
    <output aria-label="Best value">{`Current value: ${step.value}, best: ${step.best}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A string with a letter is valued by its length, so the all-digit strings are the only ones read as numbers.</p>
  </>} />
}
