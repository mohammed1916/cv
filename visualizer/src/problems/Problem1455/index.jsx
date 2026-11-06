import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1455',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with sentence and searchWord (JSON)',
  url: 'https://leetcode.com/problems/check-if-a-word-occurs-as-a-prefix-of-any-word-in-a-sentence/',
  complexity: 'O(n) time for n characters: each word is compared once, and the scan stops at the first match.',
  examples: [
    { label: 'Third word', input: '{"sentence":"keep the lantern lit tonight","searchWord":"lan"}' },
    { label: 'Late match', input: '{"sentence":"plain cake and tea","searchWord":"te"}' },
    { label: 'Inside a word', input: '{"sentence":"catalog cat","searchWord":"log"}' },
  ],
}

export default function FirstPrefixWord() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { words, index, searchWord, answer } = step.snapshot
    return <>
      <div role="img" aria-label="Sentence words" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {words.map((word, i) => {
          const hit = i === index && word.startsWith(searchWord)
          return <div key={i} data-index={i} style={{
            padding: '6px 8px', boxSizing: 'border-box', fontFamily: 'monospace', textAlign: 'center',
            border: `${i === index ? 2 : 1}px solid ${i === index ? 'var(--text)' : 'var(--border)'}`,
            background: answer === i + 1 ? 'var(--surface2)' : 'transparent', color: 'inherit',
          }}>
            <div>{hit || (i === index) ? <><strong>{word.slice(0, searchWord.length)}</strong>{word.slice(searchWord.length)}</> : word}</div>
            <small>position {i + 1}</small>
          </div>
        })}
      </div>
      <p>{index === null ? 'Words are not being compared yet.' : `Comparing the first ${searchWord.length} letters of word ${index + 1} with "${searchWord}".`}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Prefix at a boundary:</strong> each space-separated word is a separate candidate, so the search word must match from the first letter of that word.</p>
    <p><strong>First match wins:</strong> the problem asks for the earliest position, so the scan returns as soon as a word begins with the search word.</p>
  </>} />
}
