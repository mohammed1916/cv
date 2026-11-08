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
    { label: 'Own case 1', input: '{"key":"uif rvjdl cspxo gpy kvnqt pwfs uif mbaz eph","message":"wlct ct u tvfqvw"}' },
    { label: 'Own case 2', input: '{"key":"fmkvyiqxozsehurlwjtadgnbcp","message":"axy iogy mrbouq nopfjvt zdhl wdoksec"}' },
    { label: 'Identity key, one letter', input: '{"key":"abcdefghijklmnopqrstuvwxyz","message":"a"}' },
    { label: 'Spaces pass through', input: '{"key":"zyxwvutsrqponmlkjihgfedcba","message":" "}' },
    { label: 'Repeated letter reuses its entry', input: '{"key":"zyxwvutsrqponmlkjihgfedcba","message":"abc zzz"}' },
    { label: 'Longest message, 40 characters', input: '{"key":"zyxwvutsrqponmlkjihgfedcba","message":"abcdefghijklmnopqrstuvwxyzabcdefghijklmn"}' },
    { label: 'Long run: shuffled key, 40 characters', input: '{"key":"jizgavmrfhwto pxlcynkbuqsed","message":"k jr x  whqf  vheel mv ewomm brzetyjehcp"}' },
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
