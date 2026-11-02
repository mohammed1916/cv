import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty result.' },
    { id: 'word', label: 'Word', description: 'Take the next word.' },
    { id: 'sum', label: 'Sum', description: 'Add each letter weight to the running total.' },
    { id: 'map', label: 'Map', description: 'Reduce the total modulo 26 and map it to a letter.' },
    { id: 'done', label: 'Result', description: 'Return the concatenated letters.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with words and weights (26 integers, a to z)',
  url: 'https://leetcode.com/problems/weighted-word-mapping/',
  complexity: 'O(total length of words) time and O(number of words) extra space.',
  examples: [
    { label: 'Example', input: '{"words":["abcd","def","xyz"],"weights":[5,3,12,14,1,2,3,2,10,6,6,9,7,8,7,10,8,9,6,9,9,8,3,7,7,2]}' },
    { label: 'Single word', input: '{"words":["a"],"weights":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]}' },
  ],
}

export default function WeightedWordMapping() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const word = step.word >= 0 ? run.input.words[step.word] : ''
    return <>
      <IndexedSequence label={step.word >= 0 ? `word ${step.word + 1}` : 'words'} length={word.length || run.input.words.length}
        valueAt={i => (word ? word[i] : run.input.words[i])} active={step.letter ?? -1}
        roleAt={i => (word && step.letter !== undefined && i <= step.letter ? 'window' : '')} />
      <output aria-label="Running total">{`total = ${step.total ?? 0}${step.value !== undefined ? `, mod 26 = ${step.value}` : ''}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each word contributes the sum of its letter weights. Taking that sum modulo 26 gives an index from 0 to 25.</p>
    <p>That index is read from the back of the alphabet, so 0 becomes z and 25 becomes a.</p>
  </>} />
}
