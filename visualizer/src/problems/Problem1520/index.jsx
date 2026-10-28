import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Find the closed spans, one per letter.' },
    { id: 'candidate', label: 'Candidate', description: 'A letter’s span, grown until every copy of its letters is inside.' },
    { id: 'take', label: 'Take', description: 'Take the span because it starts after the last taken span ends.' },
    { id: 'skip', label: 'Skip', description: 'Skip the span because it overlaps a taken span.' },
    { id: 'done', label: 'Complete', description: 'Report the taken substrings.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (1 to 12 lowercase letters)',
  url: 'https://leetcode.com/problems/maximum-number-of-non-overlapping-substrings/',
  complexity: 'O(n * 26) time for the span checks. The visualization caps input at 12 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"adefaddaccc"}' },
    { label: 'Example 2', input: '{"s":"abab"}' },
  ],
}

export default function MaximumNonOverlappingSubstrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const inPicked = i => step.picked.some(([l, r]) => i >= l && i <= r)
    const inCurrent = i => step.current !== null && i >= step.current[0] && i <= step.current[1]
    return <>
      <IndexedSequence label="Letters of s" length={step.s.length} valueAt={i => step.s[i]} active={step.current ? step.current[0] : -1} roleAt={i => (inPicked(i) ? 'taken' : inCurrent(i) ? 'checking' : '')} />
      <output aria-label="Taken substrings">{`Taken: ${step.picked.map(([l, r]) => step.s.slice(l, r + 1)).join(', ') || 'none'}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A valid substring must contain every copy of each of its letters. Starting from a letter’s first and last copy and growing the span gives the smallest valid substring that begins there.</p>
    <p>Taking spans by earliest right end is the classic interval scheduling greedy; ties prefer the shorter span so the total length stays small.</p>
  </>} />
}
