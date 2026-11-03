import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1078',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with text, first and second',
  url: 'https://leetcode.com/problems/occurrences-after-a-bigram/',
  complexity: 'O(w) time and O(k) output space for w words and k matches. Every consecutive triple is checked once.',
  examples: [
    { label: 'Repeated follower', input: '{"text":"red blue red green red blue red","first":"red","second":"blue"}' },
    { label: 'Overlapping phrase', input: '{"text":"go go go stop","first":"go","second":"go"}' },
    { label: 'No match', input: '{"text":"one two three","first":"three","second":"one"}' },
  ],
}

export default function FollowingWords() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { words, index, window: current, collected } = step.state
    return <div>
      <div role="img" aria-label="Words in the text" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontFamily: 'monospace' }}>
        {words.map((word, position) => {
          const inWindow = index !== null && position >= index && position < index + 3
          const isFollower = index !== null && position === index + 2 && current.length === 3
          return <span key={position} data-word={position} style={{
            padding: '4px 8px', border: `2px solid ${inWindow ? 'var(--accent, #0891b2)' : 'var(--border)'}`,
            background: isFollower && step.phase === 'collect' ? 'rgba(34,197,94,.2)' : 'transparent',
          }}>{word}</span>
        })}
      </div>
      <output aria-label="Collected words">{`Collected: [${collected.join(', ')}]`}</output>
    </div>
  }} renderReasoning={() => <>
    <p><strong>Consecutive triples:</strong> each window of three words is checked, so overlapping phrases such as "go go go" are both found.</p>
    <p><strong>Order:</strong> collected words are appended in text order, keeping repeats.</p>
  </>} />
}
