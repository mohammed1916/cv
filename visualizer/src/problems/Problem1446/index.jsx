import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1446',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Lowercase string',
  url: 'https://leetcode.com/problems/consecutive-characters/',
  complexity: 'O(n) time and O(1) extra space: one pass with a running count.',
  examples: [
    { label: 'Triple o', input: 'mooo' },
    { label: 'Mixed runs', input: 'aabbbbcc' },
    { label: 'All different', input: 'abcd' },
    { label: 'Single letter', input: 'a' },
    { label: 'Two equal letters', input: 'aa' },
    { label: 'Largest allowed: 200 letters', input: 'abababababababababababababababababababababababababababababababababababababababababababababababababababababababababababababababababababababababababababababababababababababababababababababababababababab' },
    { label: 'Long run: 200 letters', input: 'dbicobftjlqkuphvghtavaocverkwcvsvfghrjzirfxxabzykbfvhcurpxecduqmztdufqgfvtnwraavrxsxmutubhlqlfetvwzytvoadpquelzowdgegocjxnebthuoblhxgrvwiphqwsuofhgrhzbecslwahaotxauafghapusghpzulflebenqhmmqerdzvooqrxv' },
  ],
}

import IndexedSequence from '../../components/shared/IndexedSequence'

export default function ConsecutiveCharacters() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { s, index, run: runLength, best, runStart, bestStart, bestEnd } = step.snapshot
    const current = index ?? -1
    const roleAt = i => {
      const parts = []
      if (current >= 0 && i === runStart) parts.push('l')
      if (current >= 0 && i === current) parts.push('r')
      if (i >= bestStart && i <= bestEnd && best > 0) parts.push('best')
      return parts.join(' ')
    }
    return <>
      <IndexedSequence label="Characters, with the current run from l to r" length={s.length} active={current}
        valueAt={i => s[i]} roleAt={roleAt} />
      <p style={{ color: 'var(--text)' }}>Current run: {runLength} (from {runStart} to {current}) · Best run: {best} (from {bestStart} to {bestEnd})</p>
      <p style={{ color: 'var(--text)' }}>{step.message}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Run:</strong> a block of the same character. The l and r markers bound the current run, and the best marker shows the longest one found so far.</p>
    <p>{step.snapshot.same === null ? 'The first character starts a run.' : step.snapshot.same ? 'This character matches its neighbour, so the run grows.' : 'This character differs, so a new run starts and l moves to it.'}</p>
  </>} />
}
