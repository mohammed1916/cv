import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Read the string.' },
    { id: 'count', label: 'Count', description: 'Count how often each letter appears.' },
    { id: 'check', label: 'Feasibility', description: 'The top letter must fit in ceil(n/2) non-adjacent slots.' },
    { id: 'place', label: 'Place', description: 'Write a letter and jump two slots ahead.' },
    { id: 'wrap', label: 'Wrap', description: 'After the even slots run out, restart at index 1.' },
    { id: 'done', label: 'Complete', description: 'Return the rearranged string or empty string.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'String s (JSON, 1-500 lowercase letters)',
  url: 'https://leetcode.com/problems/reorganize-string/',
  complexity: 'O(n + k log k) time for k distinct letters and O(n) space.',
  examples: [
    { label: 'aab', input: '"aab"' },
    { label: 'aaab (impossible)', input: '"aaab"' },
    { label: 'vvvlo', input: '"vvvlo"' },
    { label: 'aabbcc', input: '"aabbcc"' },
  ],
}
export default function ReorganizeString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Input string" length={run.input.length} valueAt={i => run.input[i]} />
    <IndexedSequence label="Result slots" length={run.input.length} active={step.i} valueAt={i => step.res[i] || '_'} roleAt={i => (step.res[i] ? 'filled' : '')} />
    <output aria-label="Letter counts">Counts (most frequent first): {step.counts.map(([c, k]) => `${c}:${k}`).join('  ')}</output>
  </>} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Why it works:</strong> a letter used at most ceil(n/2) times can occupy every other slot. Filling even indices first, most frequent letter first, keeps each letter's copies two apart. The wrap to odd indices cannot make equal letters adjacent because the only letter that spans both parities is separated by the more frequent letters before it.</p>
    <p>{step.phase === 'done' ? `Result: "${run.result}"` : `Most frequent letter: ${step.counts[0][0]}`}</p>
  </>} />
}
