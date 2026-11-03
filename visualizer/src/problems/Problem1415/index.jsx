import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1415',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Length n and rank k, separated by a space',
  url: 'https://leetcode.com/problems/the-k-th-lexicographical-string-of-all-happy-strings-of-length-n/',
  complexity: 'O(n) time and O(n) space: the answer is built letter by letter, with no enumeration of earlier strings.',
  examples: [
    { label: 'Rank 4 of 3', input: '3 4' },
    { label: 'Last of 3', input: '3 12' },
    { label: 'Beyond the end', input: '2 7' },
  ],
}

export default function HappyStringRank() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { chars, options, block, offset, chosen, total } = step.snapshot
    return <>
      <p>Built so far: <code>{chars.join('') || '(empty)'}</code> · Total strings: {total}</p>
      {options && <>
        <div style={{ display: 'flex', gap: 6 }}>
          {options.map(c => <div key={c} style={{
            padding: '6px 12px', borderRadius: 6, fontFamily: 'monospace',
            border: '2px solid', borderColor: c === chosen ? '#0891b2' : '#94a3b8',
            background: c === chosen ? '#cffafe' : undefined,
          }}>{c}</div>)}
        </div>
        <p>Each option starts a block of {block} strings. Offset inside the sorted list: {offset}.</p>
      </>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Blocks by first choice.</strong> Strings starting with the same letters are contiguous, and every block has the same size, so the rank picks a block by integer division.</p>
    <p><strong>Remove the block.</strong> Keep the remainder as the new offset and repeat at the next position.</p>
  </>} />
}
