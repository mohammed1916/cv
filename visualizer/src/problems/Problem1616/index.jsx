import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1616',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a and b, two equal-length lowercase strings (JSON)',
  url: 'https://leetcode.com/problems/split-two-strings-to-make-palindrome/',
  complexity: 'O(n) time and O(1) extra space per direction: two pointers move inward once, and the middle check scans at most n characters.',
  examples: [
    { label: 'Mirror pair', input: '{"a":"abxcd","b":"dcyba"}' },
    { label: 'No split', input: '{"a":"ab","b":"cd"}' },
    { label: 'One letter', input: '{"a":"q","b":"z"}' },
  ],
}

function Row({ name, text, i, j, segment }) {
  return <div role="img" aria-label={`String ${name}`} style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 6 }}>
    <strong style={{ width: 18, fontFamily: 'monospace', color: 'var(--text)' }}>{name}</strong>
    {[...text].map((letter, index) => {
      const inSegment = segment && segment.owner === name && index >= segment.from && index <= segment.to
      const pointer = index === i || index === j
      return <div key={index} data-index={index} style={{
        minWidth: 30, textAlign: 'center', fontFamily: 'monospace', padding: '4px 6px', boxSizing: 'border-box',
        border: `${pointer ? 2 : 1}px solid ${pointer ? 'var(--text)' : 'var(--border)'}`,
        background: inSegment ? (segment.isPalindrome ? 'color-mix(in srgb, var(--success) 30%, transparent)' : 'color-mix(in srgb, var(--error) 25%, transparent)') : 'transparent', color: 'var(--text)',
      }}>{letter}<small style={{ display: 'block', color: 'var(--text-muted)' }}>{index === i ? 'i' : index === j ? 'j' : index}</small></div>
    })}
  </div>
}

export default function SplitPalindromeVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { x, y, i, j, segment, pass } = step.snapshot
    const a = run.input.a, b = run.input.b
    const xName = x === a ? 'a' : 'b'
    const yName = xName === 'a' ? 'b' : 'a'
    return <>
      <Row name={xName} text={x ?? a} i={i} j={j} segment={segment} />
      <Row name={yName} text={y ?? b} i={i} j={j} segment={segment} />
      <p style={{ color: 'var(--text)' }}>{pass ? `${pass}: pointers i and j at ${i} and ${j}.` : 'Both strings are shown in full before any split is tried.'}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Two pointers from the outside:</strong> a palindrome built from a prefix of one string and a suffix of the other has matching characters at mirrored positions, so matching from both ends first is forced.</p>
    <p><strong>Only the middle is free:</strong> once the ends meet or disagree, the leftover middle must be a palindrome on its own, which is checked with a single scan.</p>
  </>} />
}
