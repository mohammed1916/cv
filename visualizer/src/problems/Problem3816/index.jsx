import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Letters', description: 'Find the letters that must appear in the answer.' },
    { id: 'pick', label: 'Take a letter', description: 'Take the smallest letter that still leaves every other letter reachable.' },
    { id: 'done', label: 'Complete', description: 'Report the smallest reachable string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Lowercase string (JSON object with s)',
  url: 'https://leetcode.com/problems/lexicographically-smallest-string-after-deleting-duplicate-characters/',
  complexity: 'O(n * 26) time with suffix letter sets. The visualization caps the string at 10 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"aaccb"}' },
    { label: 'Ends early', input: '{"s":"bcdcbbc"}' },
  ],
}

export default function LexicographicallySmallestAfterDeletingDuplicates() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { s } = run.input
    const roleAt = i => (step.picks.includes(i) ? 'taken' : '')
    return <IndexedSequence label="Characters" length={s.length} valueAt={i => s[i]} active={step.index} roleAt={roleAt} />
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Deleting copies is allowed only while another copy remains, so the answer keeps every letter at least once. A shorter prefix sorts first, so the search stops as soon as every letter is included.</p>
  </>} />
}
