import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty prefix', description: 'An empty prefix has no extra characters.' },
    { id: 'end', label: 'Extend prefix', description: 'Leave the last character extra, or end a dictionary word here.' },
    { id: 'done', label: 'Complete', description: 'Report the fewest extra characters for the whole string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s and dictionary (JSON)',
  url: 'https://leetcode.com/problems/extra-characters-in-a-string/',
  complexity: 'O(n^2) substring checks for a string of length n, with a set lookup each. The visualization caps s at 16 characters.',
  examples: [
    { label: 'Own case 1', input: '{"s":"mffutdpef","dictionary":["mffu","dpef","mffudpef"]}' },
    { label: 'Own case 2', input: '{"s":"tbzifmmpxpsme","dictionary":["ifmmp","xpsme"]}' },
    { label: 'One letter, no match', input: '{"s":"a","dictionary":["b"]}' },
    { label: 'Repeated letters', input: '{"s":"aaaa","dictionary":["a","aa"]}' },
    { label: 'Long run: 16 letters', input: '{"s":"abababababababab","dictionary":["ab","ba","aab","bb"]}' },
    { label: 'Full string as word', input: '{"s":"abcdabcd","dictionary":["abcd","abcdabcd","a","d"]}' },
  ],
}

export default function ExtraCharacters() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="String" length={run.input.s.length} valueAt={i => run.input.s[i]}
      active={step.end - 1} roleAt={i => (i < step.end ? `extra ${step.best[i + 1]}` : '')} />
    <output aria-label="Prefix">{`Prefix of ${step.end} characters: ${step.best[step.end]} extra`}</output>
  </>} renderReasoning={() => <>
    <p>Each prefix either ends with an extra character, or ends with a dictionary word that starts at some earlier point.</p>
    <p>Taking the smallest count over those choices gives the answer for the whole string.</p>
  </>} />
}
