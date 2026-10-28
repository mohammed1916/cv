import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count', description: 'Count the fixed letters.' },
    { id: 'pick', label: 'Pick', description: 'Choose the least used letter for the next question mark.' },
    { id: 'sort', label: 'Sort', description: 'Arrange the chosen letters in alphabetical order.' },
    { id: 'done', label: 'Complete', description: 'Report the filled string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Lowercase letters and ? (at most 3 question marks), as a JSON string',
  url: 'https://leetcode.com/problems/replace-question-marks-in-string-to-minimize-its-value/',
  complexity: 'O(q * 26) for q question marks. The visualization caps the question marks at 3.',
  examples: [
    { label: 'Example 1', input: '"???"' },
    { label: 'Example 2', input: '"a?a?"' },
  ],
}

export default function MinimizeValueFill() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="String" length={run.input.length} valueAt={i => step.text[i]}
      roleAt={i => (run.input[i] === '?' ? 'question mark' : 'fixed')} />
    <output aria-label="Picks so far">{`Picks: ${step.picks.join(' ') || 'none yet'}`}</output>
  </>} renderReasoning={() => <>
    <p>The value counts pairs of equal characters, so each new copy of a letter adds the number of copies already present.</p>
    <p>Choosing the least used letter each time keeps the total small, and the chosen letters can then be placed in sorted order without changing the value.</p>
  </>} />
}
