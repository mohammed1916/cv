import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'split', label: 'Split s', description: 'Cut s into equal blocks.' },
    { id: 'bag', label: 'Fill bag', description: 'Put each block of s into the bag.' },
    { id: 'match', label: 'Match t', description: 'Take one matching block from the bag for each block of t.' },
    { id: 'missing', label: 'Missing block', description: 'A block of t is not left in the bag.' },
    { id: 'done', label: 'Complete', description: 'Every block of t was matched.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: { "s": string, "t": string, "k": divisor of the length }',
  url: 'https://leetcode.com/problems/rearrange-k-substrings-to-form-target-string/',
  complexity: 'O(n) time and O(n) space for the block counts.',
  examples: [
    { label: 'Example 1', input: '{"s":"abcd","t":"cdab","k":2}' },
    { label: 'Example 2', input: '{"s":"aabbcc","t":"bbaacc","k":3}' },
    { label: 'Example 3', input: '{"s":"abcd","t":"acbd","k":2}' },
  ],
}

export default function RearrangeSubstrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { s, t } = run.input
    const roles = i => (step.side === 's' && i >= step.from && i < step.to ? 'block' : '')
    const tRoles = i => (step.side === 't' && i >= step.from && i < step.to ? (step.phase === 'missing' ? 'mismatch' : 'block') : '')
    return <>
      <IndexedSequence label="s" length={s.length} valueAt={i => s[i]} roleAt={roles} />
      <IndexedSequence label="t" length={t.length} valueAt={i => t[i]} roleAt={tRoles} />
      <output aria-label="Bag">{`Bag: ${Object.entries(step.bag).map(([block, c]) => `"${block}" x${c}`).join(', ') || 'empty'}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Rearranging blocks does not change which blocks exist, so s and t must contain the same blocks with the same counts.</p>
    <p>Matching t against a bag of s blocks checks exactly that, one block at a time.</p>
  </>} />
}
