import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Try the longest shared prefix first.' },
    { id: 'skip', label: 'Skip', description: 'This prefix length cannot give a larger permutation.' },
    { id: 'found', label: 'Found', description: 'Raise one letter and sort the rest.' },
    { id: 'done', label: 'Complete', description: 'No permutation is larger than target.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with s and target, for example {"s":"abc","target":"bba"}',
  url: 'https://leetcode.com/problems/lexicographically-smallest-permutation-greater-than-target/',
  complexity: 'O(n^2) time with 26 letters. The visualization caps the strings at 8 letters.',
  examples: [
    { label: 'Own case 1', input: '{"s":"bcd","target":"ccb"}' },
    { label: 'Own case 2', input: '{"s":"mffu","target":"dpef"}' },
    { label: 'Single letter', input: '{"s":"a","target":"b"}' },
    { label: 'Target equals s', input: '{"s":"aab","target":"aab"}' },
    { label: 'Longest allowed', input: '{"s":"zyxwvuts","target":"zzzzzzzz"}' },
    { label: 'Long run: 8 letters', input: '{"s":"caabdaba","target":"anghczsj"}' },
  ],
}

export default function NextPermutationAboveTarget() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Target letters" length={run.input.target.length} valueAt={i => run.input.target[i]}
      active={step.prefix ? step.prefix.length : -1}
      roleAt={i => i < (step.prefix || '').length ? 'kept prefix' : (step.pick && i === (step.prefix || '').length) ? 'position to raise' : ''} />
    <output aria-label="Letters">{`s = ${run.input.s}, target = ${run.input.target}`}</output>
    <output aria-label="Prefix">{`Kept prefix: ${step.prefix || '(none)'}${step.pick ? `, raised letter: ${step.pick}` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>A permutation that shares a longer prefix with target and is still larger is smaller overall, so the search starts with the longest prefix.</p>
    <p>At the first position that differs, pick the smallest available letter that is larger than the target letter, then place the remaining letters in sorted order.</p>
  </>} />
}
