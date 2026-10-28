import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the count to zero.' },
    { id: 'check', label: 'Check word', description: 'Does s start with this word?' },
    { id: 'done', label: 'Complete', description: 'Return the count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with "words" (list of strings) and "s" (string), JSON',
  url: 'https://leetcode.com/problems/count-prefixes-of-a-given-string/',
  complexity: 'O(total length of the words) time. The visualization caps input at 10 words of 10 letters.',
  examples: [
    { label: 'Example 1', input: '{"words":["a","b","c","ab","bc","abc"],"s":"abc"}' },
    { label: 'No prefix', input: '{"words":["x","abcd"],"s":"abc"}' },
  ],
}

export default function CountPrefixesOfAGivenString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label='Words (checked in order)' length={run.items.length} valueAt={i => String(run.items[i])} active={step.active} roleAt={i => step.roles?.[i] ?? ''} />
    <output aria-label="State">{Object.entries(step.state ?? {}).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`).join(' · ')}</output>
  </>} renderReasoning={() => <>
    <p>A word is a prefix of s exactly when s starts with that word, so each word needs one check.</p>
    <p>The loop visits every word once, so the work is proportional to the total length of the words.</p>
  </>} />
}
