import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with j at the first letter of t.' },
    { id: 'scan', label: 'Scan s', description: 'Look at the next letter of s.' },
    { id: 'match', label: 'Match', description: 'The letter equals the next needed letter of t.' },
    { id: 'done', label: 'Complete', description: 'Report how many letters must be appended.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with lowercase s and t (JSON)',
  url: 'https://leetcode.com/problems/append-characters-to-string-to-make-subsequence/',
  complexity: 'O(|s|) time and O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '{"s":"coaching","t":"coding"}' },
    { label: 'Example 2', input: '{"s":"abcde","t":"a"}' },
  ],
}

export default function AppendCharacters() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.i} roleAt={i => i < step.i ? 'seen' : ''} />
    <IndexedSequence label="t" length={run.input.t.length} valueAt={i => run.input.t[i]} active={step.j} roleAt={i => i < step.j ? 'matched' : ''} />
    <output aria-label="Matched">{`Matched ${step.j} of ${run.input.t.length} letters of t.`}</output>
  </>} renderReasoning={() => <>
    <p>Matching t greedily in s uses the earliest possible letter each time, which leaves the most room for the rest of t.</p>
    <p>The letters of t that never matched form the suffix that must be appended.</p>
  </>} />
}
