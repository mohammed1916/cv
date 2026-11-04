import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'
import { Sequence, Vars } from './SeqKit'
import './SeqKit.css'

const definition = {
  number: '1089',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of single digits',
  url: 'https://leetcode.com/problems/duplicate-zeros/',
  complexity: 'O(n) time and O(1) extra space. Writes go backward, so no unread value is overwritten.',
  examples: [
    { label: 'Zeros in the middle', input: '[1,0,2,3,0,4,5,0]' },
    { label: 'Leading zero', input: '[0,3,9]' },
    { label: 'No zeros', input: '[8,9]' },
  ],
}

export default function DuplicateZeros() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { arr, n, src, last, value } = step.state
    const pointers = {}
    if (src !== null) pointers.read = src
    if (last !== null && last < n) pointers.write = last
    return <div>
      <Sequence label={`Array of length ${n}`} values={arr} pointers={pointers} />
      <p role="status">{last >= n
        ? `The write pointer is at virtual slot ${last}, past the end, so that write is discarded.`
        : src !== null ? `Read pointer at original index ${src} (value ${value}); write pointer at ${last}.` : 'Count the zeros before any write.'}</p>
      <Vars vars={{ 'read (src)': src, 'write (last)': last, value, 'extra slots past end': Math.max(0, (last ?? n - 1) - (n - 1)) }} />
    </div>
  }} renderReasoning={() => <>
    <p><strong>Count first:</strong> each zero needs one extra slot, so the expanded length is the original length plus the zero count.</p>
    <p><strong>Backward writes:</strong> the read pointer moves left while the write pointer starts at the expanded end, so no unread value is overwritten.</p>
  </>} />
}
