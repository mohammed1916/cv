import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
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
      return <>
        <IndexedSequence label="String" length={s.length} valueAt={i => s[i]} active={index}
          roleAt={i => (i <= index ? 'read' : '')} />
        <p>Latest positions: a = {last.a}, b = {last.b}, c = {last.c}</p>
        <p>Running total: <strong>{total}</strong>{added ? ` (+${added} for this end position)` : ''}</p>
      </>
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>} />
}
