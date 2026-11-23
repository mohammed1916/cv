import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases, inputLabel, complexity, examples } from './algorithm'
import { Sequence, Vars } from './SeqKit'
import './SeqKit.css'

const definition = {
  question: "Duplicate each zero in an array in place, shifting the rest right and keeping the length fixed.",
  approaches: [
    { name: "Count zeros, then write backward", intuition: "Count how far the final array extends, then write from the end so no unread value is overwritten.", time: "O(n)", space: "O(1)" },
  ],
  number: '1089',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel,
  url: 'https://leetcode.com/problems/duplicate-zeros/',
  complexity,
  examples,
}

export default function DuplicateZeros() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { arr, n, src, last, value } = step.state
    const pointers = {}
    if (src !== null) pointers.r = src
    if (last !== null && last < n) pointers.l = last
    return <div>
      <Sequence label={`Array of length ${n}`} values={arr} pointers={pointers} />
      <p role="status">{last >= n
        ? `l is at virtual slot ${last}, past the end, so that write is discarded.`
        : src !== null ? `r reads original index ${src} (value ${value}); l writes at ${last}.` : 'Count the zeros before any write.'}</p>
      <Vars vars={{ 'r (read, src)': src, 'l (write, last)': last, value, 'extra slots past end': Math.max(0, (last ?? n - 1) - (n - 1)) }} />
    </div>
  }} renderReasoning={() => <>
    <p><strong>Count first:</strong> each zero needs one extra slot, so the expanded length is the original length plus the zero count.</p>
    <p><strong>Backward writes:</strong> the read pointer moves left while the write pointer starts at the expanded end, so no unread value is overwritten.</p>
  </>} />
}
