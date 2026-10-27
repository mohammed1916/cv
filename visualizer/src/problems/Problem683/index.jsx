import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'All dark', description: 'Every bulb starts off.' },
    { id: 'light', label: 'Light a bulb', description: 'Check the bulbs k + 1 steps away on each side.' },
    { id: 'match', label: 'Pattern found', description: 'Two lit bulbs have exactly k dark bulbs between them.' },
    { id: 'done', label: 'Never', description: 'Every day was checked without a match.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'bulbs (JSON, day i lights position bulbs[i]) and k',
  url: 'https://leetcode.com/problems/k-empty-slots/',
  complexity: 'O(n * k) time with this scan, or O(n log n) with an ordered set. The visualization caps input at 30 bulbs.',
  examples: [
    { label: 'Example 1', input: '{"bulbs":[1,3,2],"k":1}' },
    { label: 'No match', input: '{"bulbs":[1,2,3],"k":1}' },
  ],
}

export default function KEmptySlots() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Bulbs (position order)" length={run.input.bulbs.length}
      active={step.position === null ? -1 : step.position - 1}
      valueAt={i => (step.lit[i] ? 'on' : 'off')}
      roleAt={i => (step.hit === i + 1 ? 'match' : step.lit[i] ? 'read' : '')} />
    <output aria-label="Day">{step.day ? `Day ${step.day}` : 'Before day 1'}{step.result !== null && step.result !== -1 ? `: answer ${step.result}` : ''}</output>
  </>} renderReasoning={() => <>
    <p>A new bulb can only create the pattern with its nearest neighbours at distance k + 1. So each day only two candidates need checking, not every pair.</p>
    <p>The gap must be entirely dark, so the check looks at the bulbs strictly between the two.</p>
  </>} />
}
