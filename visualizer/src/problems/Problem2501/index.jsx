import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HashMapView from '../../components/shared/HashMapView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start a chain', description: 'Begin a chain at the next value in increasing order.' },
    { id: 'extend', label: 'Square', description: 'Keep squaring while the square is in the set.' },
    { id: 'record', label: 'Record', description: 'Keep the chain if it has at least two values.' },
    { id: 'done', label: 'Answer', description: 'Report the longest streak, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Numbers as JSON: {"nums": [...]}',
  url: 'https://leetcode.com/problems/longest-square-streak-in-an-array/',
  complexity: 'O(n log log M) time for n values up to M, using a hash set. The visualization caps values at 1000.',
  examples: [
    { label: 'Example 1', input: '{"nums":[4,3,6,16,8,2]}' },
    { label: 'Example 2', input: '{"nums":[2,3,5,6,7]}' },
  ],
}

export default function SquareStreak() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <HashMapView maps={step.maps} ops={step.ops} />
    <output aria-label="Current chain">{`Current chain: ${step.chain.length ? step.chain.join(' → ') : '(none)'}`}</output>
    <output aria-label="Longest streak">{`Longest streak so far: ${step.result === -1 ? 'none' : step.result}`}</output>
  </>} renderReasoning={() => <>
    <p>A streak is a chain x, x², x⁴, and so on, where each square must be present. Checking the set for the next square is one lookup.</p>
    <p>Each chain starts at its smallest value, so the longest streak is found by following every starting value once.</p>
  </>} />
}
