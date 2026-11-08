import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1461',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s and k (JSON)',
  url: 'https://leetcode.com/problems/check-if-a-string-contains-all-binary-codes-of-size-k/',
  complexity: 'O(n * k) time for a string of length n: each window is built and inserted into a set once.',
  examples: [
    { label: 'All two-bit codes', input: '{"s":"00110110","k":2}' },
    { label: 'Missing 00', input: '{"s":"0110","k":2}' },
    { label: 'Too short', input: '{"s":"0101","k":3}' },
    { label: 'Single bit', input: '{"s":"1","k":1}' },
    { label: 'Repeated code', input: '{"s":"0000","k":2}' },
    { label: 'Largest: 300 bits, k 12', input: '{"s":"011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011011","k":12}' },
    { label: 'Long run: 300 bits', input: '{"s":"100100101001011000100111100011000110011111010100011000001010111011000111100100101110011101011001101111001010000100111101101011001111001110100011111100101111001011001011101000111111110011000110011100010011111111100010110100011100110001010010010100010010010001100001010111000011111110111101111100100111","k":3}' },
  ],
}

import IndexedSequence from '../../components/shared/IndexedSequence'

const chip = { minWidth: 30, padding: '3px 5px', textAlign: 'center', fontFamily: 'monospace', fontSize: 12, border: '1px solid var(--border)', borderRadius: 5, color: 'var(--text)' }

// Every code of length k as a cell; a cell fills in once that code has been seen in a window.
function CodeGrid({ k, seen, current }) {
  const total = 2 ** k
  if (total > 64) return <p style={{ color: 'var(--text)' }}>{seen.length} of {total} codes seen.</p>
  const codes = Array.from({ length: total }, (_, n) => n.toString(2).padStart(k, '0'))
  return <div role="img" aria-label={`Codes seen: ${seen.length} of ${total}`} style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
    {codes.map(code => <span key={code} style={{
      ...chip, borderWidth: code === current ? 2 : 1, borderColor: code === current ? 'var(--primary)' : 'var(--border)',
      background: seen.includes(code) ? 'var(--primary)' : 'transparent', color: seen.includes(code) ? '#fff' : 'var(--text)',
    }}>{code}</span>)}
  </div>
}

export default function BinaryCodesAllPresent() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { s, k, needed, windows, start, seen, window: code } = step.snapshot
    const hasWindow = start !== null && start !== undefined
    const roleAt = i => {
      const parts = []
      if (hasWindow && i === start) parts.push('l')
      if (hasWindow && i === start + k - 1) parts.push('r')
      return parts.join(' ')
    }
    return <>
      <IndexedSequence label={`String s, with the length-${k} window from l to r`} length={s.length} active={hasWindow ? start + k - 1 : -1}
        valueAt={i => s[i]} roleAt={roleAt} />
      <CodeGrid k={k} seen={seen} current={code ?? null} />
      <p style={{ color: 'var(--text)' }}>{hasWindow ? `Window at ${start}: "${code}". ` : ''}Codes needed: {needed}. Windows in the string: {windows}.</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Every window is a candidate:</strong> the string has one window per start position, and a code is present when some window equals it.</p>
    <p>{step.message}</p>
  </>} />
}
