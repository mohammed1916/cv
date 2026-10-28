import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HashMapView from '../../components/shared/HashMapView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty table', description: 'No key letter has a plain letter yet.' },
    { id: 'map', label: 'Build table', description: 'Assign the next plain letter to each new key letter.' },
    { id: 'decode', label: 'Translate', description: 'Replace each message letter using the table.' },
    { id: 'done', label: 'Decoded', description: 'Return the decoded message.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Key and message as JSON: {"key": "...", "message": "..."}',
  url: 'https://leetcode.com/problems/decode-the-message/',
  complexity: 'O(k + m) time for a key of length k and message of length m. The visualization caps the message at 40 characters.',
  examples: [
    { label: 'Example 1', input: '{"key":"the quick brown fox jumps over the lazy dog","message":"vkbs bs t suepuv"}' },
    { label: 'Example 2', input: '{"key":"eljuxhpwnyrdgtqkviszcfmabo","message":"zwx hnfx lqantp mnoeius ycgk vcnjrdb"}' },
  ],
}

export default function DecodeMessage() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <HashMapView maps={step.maps} ops={step.ops} />
    <output aria-label="Decoded so far">{`Decoded so far: ${step.text || '(empty)'}`}</output>
  </>} renderReasoning={() => <>
    <p>The key is a substitution alphabet. Spaces in the key are only separators, so they are skipped when the table is built.</p>
    <p>Each message letter is one table lookup, and spaces pass through unchanged.</p>
  </>} />
}
