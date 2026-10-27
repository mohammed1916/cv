import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set up a difference array for coverage counts.' },
    { id: 'mark', label: 'Mark', description: 'Each request adds one at its start and removes one after its end.' },
    { id: 'count', label: 'Count', description: 'A running sum turns the marks into coverage counts.' },
    { id: 'sort', label: 'Sort', description: 'Sort values and counts, both largest first.' },
    { id: 'pair', label: 'Pair', description: 'Add each value times its count.' },
    { id: 'done', label: 'Complete', description: 'Report the maximum total modulo 1000000007.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and requests (JSON)',
  url: 'https://leetcode.com/problems/maximum-sum-obtained-of-any-permutation/',
  complexity: 'O(n log n + m + n) time and O(n) space. The visualization caps input at 10 values and 8 requests.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3,4,5],"requests":[[1,3],[0,1]]}' },
    { label: 'Example 2', input: '{"nums":[1,2,3,4,5,6],"requests":[[0,1]]}' },
  ],
}

export default function MaximumSumPermutation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Coverage counts" length={run.nums.length} valueAt={i => step.counts?.[i] ?? '·'} active={step.index} />
    <output aria-label="Total">{`Current result: ${step.phase === 'done' ? run.result : '(building)'}`}</output>
  </>} renderReasoning={() => <>
    <p>Each request contributes its values once per covered position, so a position covered more often should receive a larger value.</p>
    <p>The best assignment pairs sorted values with sorted counts; a difference array counts coverage in linear time.</p>
  </>} />
}
