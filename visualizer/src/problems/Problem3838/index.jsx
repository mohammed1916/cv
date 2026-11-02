import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'
import WeightedMappingVisual from './WeightedMappingVisual'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty result.' },
    { id: 'word', label: 'Word', description: 'Take the next word and reset the total.' },
    { id: 'sum', label: 'Sum', description: 'Add each letter weight to the running total.' },
    { id: 'mod', label: 'Modulo', description: 'Reduce the total modulo 26.' },
    { id: 'emit', label: 'Map', description: 'Map the residue to a letter in reverse alphabet order and append it.' },
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
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <WeightedMappingVisual run={run} step={step} />} renderReasoning={() => <>
    <p>Each word contributes the sum of its letter weights. Taking that sum modulo 26 gives an index from 0 to 25.</p>
    <p>That index is read from the back of the alphabet, so 0 becomes z and 25 becomes a. The output panel keeps every letter built so far.</p>
  </>} />
}
