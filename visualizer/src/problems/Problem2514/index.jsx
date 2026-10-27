import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the answer to one.' },
    { id: 'word', label: 'Word', description: 'Count the arrangements of this word and multiply them in.' },
    { id: 'done', label: 'Complete', description: 'Report the count modulo 1e9+7.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a sentence s (JSON)',
  url: 'https://leetcode.com/problems/count-anagrams/',
  complexity: 'O(n * k) time where n is the length and k the number of words. The visualization caps the sentence at 40 characters and 6 words.',
  examples: [
    { label: 'Two words', input: '{"s":"ab cd"}' },
    { label: 'Repeated letters', input: '{"s":"aab bc"}' },
  ],
}

export default function CountAnagrams() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Words" length={run.words.length} valueAt={i => run.words[i]}
      active={Math.max(0, step.word)} roleAt={i => (i <= step.word ? 'multiplied' : '')} />
    <output aria-label="Running product">{`Running product: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Words are rearranged independently, so the total is a product over words.</p>
    <p>A word with repeated letters has len! / (count of each letter)! distinct arrangements, since identical letters are not distinguished.</p>
  </>} />
}
