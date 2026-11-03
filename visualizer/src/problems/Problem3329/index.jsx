import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import WindowTilesView from './WindowTilesView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '3329',
  phases: [
    { id: 'start', label: 'Setup', description: 'Measure the string and its substrings.' },
    { id: 'add', label: 'Add', description: 'Extend the window to the right.' },
    { id: 'shrink', label: 'Shrink', description: 'Drop letters on the left until the new letter is below k.' },
    { id: 'count', label: 'Count', description: 'Count the substrings ending here that stay below k.' },
    { id: 'done', label: 'Result', description: 'Subtract the bad substrings from the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (lowercase letters) and k',
  url: 'https://leetcode.com/problems/count-substrings-with-k-frequency-characters-ii/',
  complexity: 'O(n) time with a sliding window over counts of 26 letters, O(1) extra space. The visualization caps s at 20 characters and k at 10; the rule used is that a substring counts when some letter occurs at least k times.',
  examples: [
    { label: 'Mixed letters', input: '{"s":"abacbab","k":2}' },
    { label: 'Long run', input: '{"s":"aaabb","k":3}' },
  ],
}

export default function CountKFrequencySubstrings() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <WindowTilesView run={run} step={step} />}
      renderReasoning={({ step }) => (
        <>
          <p>Count the bad substrings instead, where every letter stays below k. The window never contains a letter at k or more, so each right end adds exactly its window size.</p>
          <p>{step.done ? `Good substrings = total minus bad = ${step.result}.` : 'The bad count grows as the window widens; the answer is the total minus it.'}</p>
        </>
      )}
    />
  )
}
