import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin DFS with an empty prefix.' },
    { id: 'branch', label: 'Branch case', description: 'A letter splits into lowercase and uppercase branches.' },
    { id: 'digit', label: 'Keep digit', description: 'A digit continues with a single branch.' },
    { id: 'emit', label: 'Emit', description: 'A full-length prefix is recorded as a result.' },
    { id: 'done', label: 'Complete', description: 'All permutations are collected.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'String s (JSON)',
  url: 'https://leetcode.com/problems/letter-case-permutation/',
  complexity: 'O(2^L * n) time for L letters and length n; O(n) recursion depth plus output.',
  examples: [
    { label: 'a1b2', input: '"a1b2"' },
    { label: '3z4', input: '"3z4"' },
    { label: 'C', input: '"C"' },
  ],
}
export default function LetterCasePermutation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Input characters" length={run.input.length} active={step.phase === 'done' ? -1 : step.index} valueAt={i => run.input[i]} roleAt={i => i < step.index ? 'fixed' : ''} />
    <IndexedSequence label="Current prefix" length={Math.max(step.path.length, 1)} valueAt={i => step.path[i] ?? ' '} />
    <IndexedSequence label="Results so far (latest 16)" length={Math.min(step.count, 16)} valueAt={i => run.result[Math.max(0, step.count - 16) + i]} indexOffset={Math.max(0, step.count - 16)} />
    <output aria-label="Result count">Permutations found: {step.count}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Only letters branch, so L letters produce exactly 2^L results, each a distinct string.</p>
    <p>Backtracking builds the prefix left to right; returning from a call simply abandons that prefix because strings are immutable.</p>
  </>} />
}
