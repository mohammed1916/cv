import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PrefixStateView from './PrefixStateView'
import './PrefixStateView.css'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'table', label: 'Failure table', description: 'Find the longest border of each pattern prefix.' },
    { id: 'start', label: 'Setup', description: 'The table is ready; the matched prefix is empty.' },
    { id: 'read', label: 'Read', description: 'Call next() to take one bit from the stream.' },
    { id: 'fall', label: 'Fall back', description: 'Use the failure table instead of rereading bits.' },
    { id: 'advance', label: 'Extend', description: 'The bit continues the matched prefix.' },
    { id: 'miss', label: 'Miss', description: 'The bit starts no prefix; the state stays at 0.' },
    { id: 'found', label: 'Found', description: 'The matched prefix covers the whole pattern.' },
    { id: 'done', label: 'Result', description: 'Report the start index.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with stream (the bits it yields) and pattern',
  url: 'https://leetcode.com/problems/find-pattern-in-infinite-stream-ii/',
  complexity: 'O(n + m) time and O(m) extra space for n bits read and a pattern of m bits. The visualization caps the stream at 60 bits and the pattern at 12 bits.',
  examples: [
    { label: 'Longer pattern', input: '{"stream":"101101110010","pattern":"110010"}' },
    { label: 'Long run of zeros', input: '{"stream":"0000000001","pattern":"0001"}' },
    { label: 'Repeated prefix', input: '{"stream":"10101010110","pattern":"101011"}' },
  ],
}

export default function FindPatternInStreamII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <PrefixStateView run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The failure table lets a mismatch jump to the longest prefix that still fits the bits already read, so each bit is read once and the state moves forward at most n times.</p>
  </>} />
}
