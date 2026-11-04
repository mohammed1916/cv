import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import * as model from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Setup', description: 'The empty prefix has one way.' },
    { id: 'loop', label: 'Prefix', description: 'Start counting splits of the next prefix.' },
    { id: 'check', label: 'Check start', description: 'Test one earlier start point for exactly one 1.' },
    { id: 'result', label: 'Result', description: 'Report the count for the whole array.' },
  ], parse: model.parseInput, build: model.buildTrace, code: model.code, python: model.python,
  inputLabel: 'Object with nums (a list of 0 and 1 values)', url: 'https://leetcode.com/problems/ways-to-split-array-into-good-subarrays/',
  complexity: 'O(n^2) for this teaching model, which checks every start point. The visualization caps nums at 50 values.',
  examples: [{ label: 'Ones spread out', input: '{"nums":[0,1,1,0,0,1,0]}' }, { label: 'Single one', input: '{"nums":[0,0,1]}' }],
}

export default function ProblemVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => {
      // ways[i] counts good splits of the first i items. Each cell is filled from earlier prefixes j,
      // and only those where nums[j..i-1] holds exactly one 1 contribute.
      const n = run.input.nums.length
      const ways = Array(n + 1).fill(null)
      for (const f of run.frames) if (f.column !== undefined && f.column !== null && f.value !== null && f.phase !== 'result') ways[f.column] = f.value
      const column = step.column ?? 0
      const roleAt = i => (i === column ? 'current' : i < column ? 'filled' : 'pending')
      const l = step.l, r = step.r
      const nums = run.input.nums
      return <>
        <IndexedSequence label="Prefix length ways" length={n + 1} valueAt={i => (ways[i] ?? '·')} active={column} roleAt={roleAt} />
        <IndexedSequence label="Items of nums with the subarray being tested" length={n} valueAt={i => nums[i]} active={l ?? -1}
          roleAt={i => (l !== null && i === l ? 'l' : r !== null && i === r ? 'r' : l !== null && i > l && i < r ? 'inside' : '')} />
        <p style={{ color: 'var(--text)' }}>{step.message}</p>
      </>
    }}
    renderReasoning={() => <p>A split ends a good subarray at position i; the subarray starts after an earlier prefix j. Only subarrays containing exactly one 1 are allowed, so each allowed start adds its own ways.</p>} />
}
