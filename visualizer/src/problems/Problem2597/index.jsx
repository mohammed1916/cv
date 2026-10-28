import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No number has been decided yet.' },
    { id: 'include', label: 'Include', description: 'Add this number to the subset and continue.' },
    { id: 'blocked', label: 'Blocked', description: 'A chosen number is exactly k away, so this one cannot join.' },
    { id: 'leaf', label: 'Leaf', description: 'A full choice is complete, so count it if it is non-empty.' },
    { id: 'done', label: 'Complete', description: 'Report the number of beautiful subsets.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and k (JSON)',
  url: 'https://leetcode.com/problems/the-number-of-beautiful-subsets/',
  complexity: 'O(2^n) subsets in the worst case, with each check done by a map lookup. The visualization caps n at 12.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,4,6],"k":2}' },
    { label: 'Example 2', input: '{"nums":[1],"k":1}' },
  ],
}

export default function BeautifulSubsets() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    for (const index of step.picked) roles[index] = 'picked'
    return <>
      <IndexedSequence label="Numbers" length={run.input.nums.length} active={step.index >= 0 && step.index < run.input.nums.length ? step.index : -1}
        valueAt={index => run.input.nums[index]}
        roleAt={index => (roles[index] ? 'picked' : step.blocked && index === step.index ? 'blocked' : '')} />
      <output aria-label="Chosen numbers">{`Chosen: ${step.picked.map(i => run.input.nums[i]).join(', ') || '(none)'} · count ${step.count}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A subset is beautiful when no two chosen numbers differ by exactly k, so each number is either included or skipped.</p>
    <p>Counting with a map of chosen values makes the conflict check constant time for each candidate.</p>
  </>} />
}
