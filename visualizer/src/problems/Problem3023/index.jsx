import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import StreamWindowView from './StreamWindowView'
import './StreamWindowView.css'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Setup', description: 'Set the pattern length and an empty window.' },
    { id: 'read', label: 'Read', description: 'Call next() to take one bit from the stream.' },
    { id: 'slide', label: 'Slide', description: 'Append the bit and keep only the last m bits.' },
    { id: 'check', label: 'Check', description: 'The window is full, so compare it with the pattern.' },
    { id: 'compare', label: 'Agree', description: 'This window bit equals the pattern bit.' },
    { id: 'mismatch', label: 'Mismatch', description: 'This window cannot be the pattern; slide on.' },
    { id: 'found', label: 'Found', description: 'Every bit of the window matched.' },
    { id: 'done', label: 'Result', description: 'Report the start index.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with stream (the bits it yields) and pattern',
  url: 'https://leetcode.com/problems/find-pattern-in-infinite-stream-i/',
  complexity: 'O(n * m) time and O(m) extra space for n bits read and a pattern of m bits. The visualization caps the stream at 60 bits and the pattern at 12 bits.',
  examples: [
    { label: 'Pattern inside a longer run', input: '{"stream":"0110101101","pattern":"1011"}' },
    { label: 'Single bit', input: '{"stream":"000001","pattern":"1"}' },
    { label: 'Five bit pattern', input: '{"stream":"1111011","pattern":"11011"}' },
  ],
}

export default function FindPatternInStreamI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <StreamWindowView run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The window holds only the most recent m bits, so memory stays at m bits no matter how long the stream runs.</p>
  </>} />
}
