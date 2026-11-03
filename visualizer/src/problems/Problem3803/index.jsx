import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: 3803,
  phases: [
    { id: 'prefix', label: 'Prefix', description: 'Extend the prefix by one letter and update the distinct count.' },
    { id: 'done', label: 'Result', description: 'Report how many prefixes were residues.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (lowercase letters)',
  url: 'https://leetcode.com/problems/count-residue-prefixes/',
  complexity: 'O(n) time with a set of at most 26 letters.',
  examples: [
    { label: 'Short word', input: '{"s":"xyz"}' },
    { label: 'Repeats', input: '{"s":"aabbaa"}' },
  ],
}

export default function CountResiduePrefixes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.at}
      roleAt={i => (step.at >= 0 && i <= step.at ? 'prefix' : '')} />
    <output aria-label="Prefix check">{step.at >= 0
      ? `length ${step.length}, distinct ${step.distinct}, length mod 3 ${step.length % 3}: ${step.residue ? 'residue' : 'not residue'}; count ${step.count}`
      : `count ${step.count}`}</output>
  </>} renderReasoning={() => <>
    <p>A prefix is a residue when its number of distinct letters equals its length modulo 3.</p>
    <p>Each prefix differs from the previous one by a single appended letter, so one set of seen letters can be extended rather than rebuilt.</p>
  </>} />
}
