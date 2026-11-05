import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm'

const definition = {
  number: '1400', phases, parse: parseInput, build: buildTrace, code, python, examples,
  inputLabel: 'Object with s and k (JSON)',
  url: 'https://leetcode.com/problems/construct-k-palindrome-strings/',
  complexity: 'O(n + 26) time to count the letters, and O(26) extra space.',
}

export default function KPalindromeVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const s = step.snapshot
    return <>
      <RecordStateTable label="Letter counts (odd counts need a center)" columns={['letter', 'count', 'odd']} rows={s.rows}
        activeRow={s.rows.findIndex(r => r.letter === s.current)} />
      <StackLane title="Odd letters and k" items={[`odd letters ${s.odd}`, `palindromes wanted ${s.k}`]} />
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Centers:</strong> a palindrome has at most one odd-count letter in its middle, so each odd letter forces one palindrome, and there must be at least k letters to split.</p>
    <p>{step.message}</p>
  </>} />
}
