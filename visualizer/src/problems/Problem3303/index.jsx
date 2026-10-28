import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set up the window length.' },
    { id: 'window', label: 'Window', description: 'Compare this window with the pattern.' },
    { id: 'reject', label: 'Reject', description: 'The window has two or more mismatches.' },
    { id: 'match', label: 'Match', description: 'The window has at most one mismatch.' },
    { id: 'done', label: 'Complete', description: 'No window qualifies.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Text and pattern (JSON object with s and pattern)',
  url: 'https://leetcode.com/problems/find-the-occurrence-of-first-almost-equal-substring/',
  complexity: 'O(n * m) time and O(1) space in this trace. The visualization caps s at 40 characters.',
  examples: [
    { label: 'Example 1', input: '{"s":"abcdefg","pattern":"bcdffg"}' },
    { label: 'Example 2', input: '{"s":"ababbababa","pattern":"bacaba"}' },
    { label: 'No match', input: '{"s":"abcd","pattern":"dba"}' },
  ],
}

export default function FirstAlmostEqual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const inWindow = i => step.start >= 0 && i >= step.start && i < step.start + step.length
    return <>
      <IndexedSequence label="Text s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.start >= 0 ? step.start : -1}
        roleAt={i => (inWindow(i) ? 'window' : '')} />
      <output aria-label="Window">{`Pattern: ${run.input.pattern}, mismatches in window: ${step.mismatches}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Stopping at the second mismatch keeps each window's check short, and a window with at most one mismatch is almost equal to the pattern.</p>
  </>} />
}
