import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1456',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with text and k (JSON)',
  url: 'https://leetcode.com/problems/maximum-number-of-vowels-in-a-substring-of-given-length/',
  complexity: 'O(n) time and O(1) extra space: each character enters and leaves the window once.',
  examples: [
    { label: 'Vowel run', input: '{"text":"aeiouxyz","k":3}' },
    { label: 'Mixed', input: '{"text":"bcdfgaeb","k":2}' },
    { label: 'Whole text', input: '{"text":"aei","k":3}' },
  ],
}

const cell = {
  minWidth: 34, padding: '6px 4px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
}

export default function MaxVowels() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { text, k, start, count, best, bestStart, entering, leaving } = step.snapshot
    const inWindow = i => start !== null && i >= start && i < start + k
    return <>
      <div role="img" aria-label="Text with the current window" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {[...text].map((ch, i) => {
          const vowel = 'aeiou'.includes(ch)
          return <div key={i} data-index={i} style={{
            ...cell,
            border: `${i === entering ? 2 : 1}px solid ${i === leaving ? '#dc2626' : i === entering ? '#16a34a' : 'var(--border)'}`,
            background: inWindow(i) ? 'var(--surface2)' : 'transparent',
            opacity: inWindow(i) ? 1 : 0.55, color: 'inherit', fontWeight: vowel ? 700 : 400,
          }}>
            <div>{ch}</div><small>{i}</small>
          </div>
        })}
      </div>
      <p>
        {start === null ? 'The answer is final.' : `Window: positions ${start} to ${start + k - 1}, vowels now ${count}.`}
        {' '}Best so far: {best} (window starting at {bestStart}).
      </p>
      {entering !== null && <p>Entering at {entering} (green border), leaving at {leaving} (red border).</p>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Fixed width:</strong> every window has exactly k characters, so moving the window changes the count by at most one entering and one leaving character.</p>
    <p><strong>Reuse the count:</strong> recounting each window would repeat work; subtracting the leaving letter and adding the entering letter keeps each step constant-time.</p>
  </>} />
}
