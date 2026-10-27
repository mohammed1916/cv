import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Matching the empty pattern keeps nothing.' },
    { id: 'read', label: 'Read index', description: 'Each source character may extend a match; a kept target costs one.' },
    { id: 'done', label: 'Complete', description: 'Report the targets minus the fewest kept.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with source, pattern and targetIndices',
  url: 'https://leetcode.com/problems/find-maximum-removals-from-source-string/',
  complexity: 'O(n * m) time and O(m) space for the pattern DP. The visualization caps source at 16 characters.',
  examples: [
    { label: 'Example 1', input: '{"source":"abbaa","pattern":"aba","targetIndices":[0,1,2]}' },
    { label: 'Example 2', input: '{"source":"bcda","pattern":"d","targetIndices":[0,3]}' },
  ],
}

export default function MaximumRemovals() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Source characters (targets marked)" length={run.input.source.length}
      valueAt={i => run.input.source[i]} active={step.index}
      roleAt={i => (run.input.targetIndices.includes(i) ? 'target' : '')} />
    <output aria-label="Best table">{`Fewest kept targets for each pattern prefix: ${step.best.map(v => (v === Infinity ? '-' : v)).join(', ')}`}</output>
  </>} renderReasoning={() => <>
    <p>Every target the pattern does not need can be deleted, so the answer is the target count minus the fewest targets the match must keep.</p>
    <p>best[j] tracks that minimum for each pattern prefix while reading the source left to right. Scanning the pattern backwards stops one source character from being used twice.</p>
  </>} />
}
