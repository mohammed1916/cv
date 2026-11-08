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
    { label: 'Own case 1', input: '{"words":["bcde","efg","yza"],"weights":[6,4,13,15,2,3,4,3,11,7,7,10,8,9,8,11,9,10,7,10,10,9,4,8,8,3]}' },
    { label: 'Single word', input: '{"words":["a"],"weights":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]}' },
    { label: 'One letter word', input: '{"words":["q"],"weights":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26]}' },
    { label: 'Equal weights', input: '{"words":["ab","ba"],"weights":[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5]}' },
    { label: 'Ten words, largest weights', input: '{"words":["zzzzzzzzzz","zzzzzzzzzz","zzzzzzzzzz","zzzzzzzzzz","zzzzzzzzzz","zzzzzzzzzz","zzzzzzzzzz","zzzzzzzzzz","zzzzzzzzzz","zzzzzzzzzz"],"weights":[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100]}' },
    { label: 'Long run: 10 words', input: '{"words":["ylqziaxdh","kwzzrmhd","ojwkmiks","a","lziz","uqvdbpvkzu","esnu","ughp","dmwix","r"],"weights":[62,35,7,100,54,8,91,82,27,58,1,41,14,4,35,83,77,55,42,14,69,82,83,70,88,11]}' },
  ],
}

export default function WeightedWordMapping() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <WeightedMappingVisual run={run} step={step} />} renderReasoning={() => <>
    <p>Each word contributes the sum of its letter weights. Taking that sum modulo 26 gives an index from 0 to 25.</p>
    <p>That index is read from the back of the alphabet, so 0 becomes z and 25 becomes a. The output panel keeps every letter built so far.</p>
  </>} />
}
