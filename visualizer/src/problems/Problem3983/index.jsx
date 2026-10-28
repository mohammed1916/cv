import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'prefix', label: 'Prefix', description: 'Match s from the left as far as possible in t.' },
    { id: 'suffix', label: 'Suffix', description: 'Match s from the right as far as possible in t.' },
    { id: 'check', label: 'Plain check', description: 'See whether s already fits without a change.' },
    { id: 'try', label: 'Try position', description: 'Check whether one letter can sit between the prefix and suffix.' },
    { id: 'done', label: 'Complete', description: 'Report the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Strings (JSON object with s and t)',
  url: 'https://leetcode.com/problems/subsequence-after-one-replacement/',
  complexity: 'O(n + m) time and O(n + m) space. The visualization caps s at 12 letters and t at 16.',
  examples: [
    { label: 'True', input: '{"s":"cat","t":"chat"}' },
    { label: 'False', input: '{"s":"plane","t":"apple"}' },
  ],
}

export default function SubsequenceAfterOneReplacement() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.i ?? -1} />
    <IndexedSequence label="t" length={run.input.t.length} valueAt={i => run.input.t[i]} active={-1}
      roleAt={i => (step.prefix && step.prefix[step.i] !== undefined && i < step.prefix[step.i] ? 'prefix' : '')} />
  </>} renderReasoning={() => <>
    <p>A prefix of s matched greedily ends at some position of t, and a suffix matched greedily from the right starts at another.</p>
    <p>One replaced letter can be any letter, so it works whenever a position of t lies between the two ends.</p>
  </>} />
}
