import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no substrings counted.' },
    { id: 'scan', label: 'Extend', description: 'Add the substrings that end at this index.' },
    { id: 'done', label: 'Complete', description: 'Report the total appeal.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object {"s": lowercase string, up to 20 letters}',
  url: 'https://leetcode.com/problems/total-appeal-of-a-string/',
  complexity: 'O(n) time and O(1) extra space for the 26 letters. The visualization caps input at 20 letters.',
  examples: [
    { label: 'Example 1', input: '{"s": "abbca"}' },
    { label: 'Example 2', input: '{"s": "code"}' },
  ],
}

export default function TotalAppealOfAString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Letters" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.index} roleAt={i => (i <= step.index ? 'seen' : '')} />
    <output aria-label="Running total">{`Current ${step.current}, total ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Each substring is counted once, at the index where it ends. Its distinct count rises by one for each letter that did not occur earlier in it.</p>
    <p>A letter at index j is new to every substring starting after its previous occurrence, so the new starts are j minus that position.</p>
  </>} />
}
