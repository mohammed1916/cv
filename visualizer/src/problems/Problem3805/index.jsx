import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, gapKey } from './algorithm'

const definition = {
  number: 3805,
  phases: [
    { id: 'key', label: 'Signature', description: 'Describe the word by its letter gaps from the first letter.' },
    { id: 'pair', label: 'Pair', description: 'Every earlier word with the same signature forms a pair.' },
    { id: 'done', label: 'Result', description: 'Report the total number of similar pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with words (equal-length lowercase strings)',
  url: 'https://leetcode.com/problems/count-caesar-cipher-pairs/',
  complexity: 'O(n * m) time to build the signatures and a hash map of counts.',
  examples: [
    { label: 'Shifted pairs', input: '{"words":["abc","bcd","xyz","xab"]}' },
    { label: 'Same letters', input: '{"words":["aa","bb","cd"]}' },
    { label: 'One word', input: '{"words":["a"]}' },
    { label: 'Equal words', input: '{"words":["ab","ab"]}' },
    { label: 'Twelve shifts of one word', input: '{"words":["abcdefgh","bcdefgha","cdefghab","defghabc","efghabcd","fghabcde","ghabcdef","habcdefg","abcdefgh","bcdefgha","cdefghab","defghabc"]}' },
    { label: 'Long run: 12 words', input: '{"words":["ffsfkqoh","zeplihdq","gsygkqmv","zsqebbln","gzikqlfr","beqhdjzy","rjesngja","nknmvigr","opufnhoq","xfspdtrf","cqpybjnl","sagglpds"]}' },
  ],
}

export default function CountCaesarCipherPairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Current signature">{step.key !== undefined ? `Signature ${step.key}: ${step.matches} earlier word${step.matches === 1 ? '' : 's'} share it` : 'Waiting for the first word'}</output>
    <table aria-label="Signatures">
      <thead><tr><th>index</th><th>word</th><th>gap signature</th></tr></thead>
      <tbody>{run.input.words.map((word, i) => <tr key={i} data-current={step.at === i ? 'yes' : undefined}>
        <td>{i}</td><td>{word}</td><td>{gapKey(word)}</td></tr>)}</tbody>
    </table>
    <output aria-label="Pairs so far">{`pairs ${step.pairs}${step.at >= 0 ? `, current signature ${step.key}` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>Shifting every letter by the same amount keeps the differences between neighbouring letters, and the gaps from the first letter, unchanged.</p>
    <p>Two words are similar exactly when their gap signatures match, so a counter of earlier signatures gives each new word its pair count directly.</p>
  </>} />
}
