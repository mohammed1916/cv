import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty set', description: 'No letter starts a piece yet.' },
    { id: 'repeat', label: 'Repeat', description: 'This letter already starts a piece.' },
    { id: 'cut', label: 'New start', description: 'A new piece begins at this letter.' },
    { id: 'done', label: 'Result', description: 'Count the distinct starting letters.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (lowercase letters)',
  url: 'https://leetcode.com/problems/maximum-substrings-with-distinct-start/',
  complexity: 'O(n) time and O(1) extra space, because at most 26 letters can begin a piece. The visualization caps s at 20 letters.',
  examples: [
    { label: 'Mixed', input: '{"s":"mellow"}' },
    { label: 'Repeats', input: '{"s":"zzzz"}' },
  ],
}

export default function MaximumSubstringsWithDistinctStart() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.at}
      roleAt={i => (step.starts.includes(i) ? 'window' : '')} />
    <output aria-label="Piece count">{`${step.starts.length} piece start${step.starts.length === 1 ? '' : 's'} so far`}</output>
  </>} renderReasoning={() => <>
    <p>Every piece must begin with a letter that no other piece begins with, so the number of pieces is at most the number of distinct letters.</p>
    <p>Cutting at the first appearance of each new letter reaches that bound, so the answer is the count of distinct letters.</p>
  </>} />
}
