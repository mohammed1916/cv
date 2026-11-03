import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with text and queries (JSON)',
  url: 'https://leetcode.com/problems/can-make-palindrome-from-substring/',
  complexity: 'O(n + q) time after the prefix masks are built: each query is one XOR and one popcount. O(n) space for the masks.',
  examples: [
    { label: 'First', input: '{"text":"abcda","queries":[[0,4,0],[0,4,1],[1,3,0],[1,3,1],[2,2,0]]}' },
    { label: 'Second', input: '{"text":"xyzzyq","queries":[[0,5,0],[0,5,2],[1,4,0]]}' },
  ],
}

export default function CanMakePalindromeFromSubstring() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { query, letters, need, k, answer, answers, index } = step.snapshot
    const [l, r] = query ?? [-1, -2]
    return <>
      <div role="img" aria-label="Text" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {[...run.input.text].map((ch, i) => <div key={i} data-index={i} style={{
          width: 36, height: 36, boxSizing: 'border-box', display: 'grid', placeItems: 'center', fontFamily: 'monospace',
          border: index === i ? '2px solid var(--text)' : '1px solid var(--border)',
          background: i >= l && i <= r ? '#a5f3fc' : 'transparent',
        }}>{ch}</div>)}
      </div>
      <output aria-label="Query state">{query
        ? `Query [${query.join(', ')}] · odd letters: ${letters.length ? letters.join(' ') : 'none'} · replacements needed: ${need ?? '-'} · k: ${k}${answer === null ? '' : ` · ${answer ? 'true' : 'false'}`}`
        : 'Prefix masks are being built.'}</output>
      <output aria-label="Answers">{`Answers: [${answers.map(a => (a ? 'true' : 'false')).join(', ')}]`}</output>
    </>
  }} renderReasoning={() => <>
    <p><strong>Parity mask:</strong> XOR of two prefix masks leaves a bit for each letter with an odd count in the substring.</p>
    <p><strong>Palindrome test:</strong> one odd letter may sit in the center, so floor(odd / 2) replacements are needed. The answer is true when that number is at most k.</p>
  </>} />
}
