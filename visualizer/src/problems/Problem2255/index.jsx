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
    { label: 'Four words in a string', input: '{"words":["sea","tea","ten","eat"],"s":"teas"}' },
    { label: 'No prefix', input: '{"words":["x","abcd"],"s":"abc"}' },
    { label: 'Single word matches', input: '{"words":["a"],"s":"a"}' },
    { label: 'Duplicate words count twice', input: '{"words":["ab","ab","a"],"s":"ab"}' },
    { label: 'Word longer than s', input: '{"words":["abcdefghij"],"s":"abc"}' },
    { label: 'Long run: 10 words', input: '{"words":["babbb","b","babbbcbcbb","babbbc","bab","babb","babbbcbcbb","babbb","bab","babb"],"s":"babbbcbcbbccccbabaac"}' },
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
