import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No target character is matched yet.' },
    { id: 'match', label: 'Match', description: 'A character of s1 advances the targets.' },
    { id: 'improve', label: 'New window', description: 'A shorter complete window was found.' },
    { id: 'scan', label: 'Scan', description: 'The character does not advance any target.' },
    { id: 'done', label: 'Complete', description: 'Return the shortest window.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 's1 and s2 (JSON object)',
  url: 'https://leetcode.com/problems/minimum-window-subsequence/',
  complexity: 'O(n * m) time and O(m) extra space.',
  examples: [
    { label: 'Scattered', input: '{"s1":"xaybzcx","s2":"abc"}' },
    { label: 'Order matters', input: '{"s1":"cbaxbca","s2":"ba"}' },
    { label: 'No match', input: '{"s1":"qwerty","s2":"yq"}' },
    { label: 'Single letter', input: '{"s1":"a","s2":"a"}' },
    { label: 'Repeated letters', input: '{"s1":"aaaa","s2":"aa"}' },
    { label: 'Longest allowed, 40 letters', input: '{"s1":"abcdabcdabcdabcdabcdabcdabcdabcdabcdabcd","s2":"dcbadcbadcbadcbadcbadcbadcbadcbadcbadcba"}' },
    { label: 'Long run: 40 letters', input: '{"s1":"babbcaccbbbbccababbbccbbbbcaacbccacbbcaa","s2":"ccbbabcccccabcbbacabbacbbcbbbcaabcabaabc"}' },
  ],
}

export default function MinimumWindowSubsequence() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s1 (best window marked)" length={run.input.s1.length} active={step.i}
      valueAt={i => run.input.s1[i]}
      roleAt={i => (step.best && i === step.best[0] ? 'l' : step.best && i === step.best[1] ? 'r' : step.best && i > step.best[0] && i < step.best[1] ? 'window' : i === step.i ? 'now' : '')} />
    <RecordStateTable label="Target positions: where the match for s2[0..j] began" columns={['j', 's2[j]', 'start']}
      rows={run.input.s2.split('').map((ch, j) => ({ j, 's2[j]': ch, start: step.start[j] }))} activeRow={-1} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>For each position in s1, the table remembers where the latest match of each prefix of s2 began. A complete match ending here gives a window from its start to the current position.</p>
    <p>Targets are updated from the last one backwards, so a single character of s1 never fills two places. Shorter windows replace longer ones only when strictly shorter, which keeps the leftmost.</p>
  </>} />
}
