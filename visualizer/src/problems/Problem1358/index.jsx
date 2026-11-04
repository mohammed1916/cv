import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, phases, code, python } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'String of a, b and c (JSON object with s)',
  complexity: 'O(n) time and O(1) space. The window of latest positions only tracks three letters.',
  examples: [
    { label: 'Sample', input: '{"s":"abcabc"}' },
    { label: 'Repeated a', input: '{"s":"aaacb"}' },
    { label: 'Missing b', input: '{"s":"abab"}' },
  ],
}

export default function SubstringsWithAllThreeLetters() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => {
      const { s, index, last, total, added } = step.snapshot
      const earliest = Math.min(last.a, last.b, last.c)
      return <>
        <IndexedSequence label="String" length={s.length} valueAt={i => s[i]} active={index}
          roleAt={i => {
            if (i === index) return 'r'
            if (earliest >= 0 && i <= earliest) return 'window'
            return ''
          }} />
        <RecordStateTable label="Latest position of each letter" columns={['letter', 'latest index']}
          rows={['a', 'b', 'c'].map(ch => ({ letter: ch, 'latest index': last[ch] < 0 ? 'not seen' : last[ch] }))} />
        <p>Earliest latest position: {earliest < 0 ? 'not every letter seen yet' : earliest}. Starts 0 to {earliest} are valid for end {index}.</p>
        <p>Running total: <strong>{total}</strong>{added ? ` (+${added} for this end position)` : ''}</p>
      </>
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>} />
}
