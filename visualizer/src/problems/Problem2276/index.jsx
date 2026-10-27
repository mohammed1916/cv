import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SegtreeView from '../../components/shared/SegtreeView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'No integers covered.' },
    { id: 'add', label: 'Add interval', description: 'Mark the covered leaves; whole nodes take the range count.' },
    { id: 'count', label: 'Count', description: 'Read the root value.' },
    { id: 'done', label: 'Complete', description: 'Report every recorded count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Operations as JSON [["add", l, r] or ["count"], ...] (integers 1 to 32)',
  url: 'https://leetcode.com/problems/count-integers-in-intervals/',
  complexity: 'O(log M) per operation with a lazy segment tree over M values; the visualization caps M at 32.',
  examples: [
    { label: 'Example', input: '[["add",2,3],["add",7,10],["count"],["add",5,8],["count"]]' },
  ],
}

export default function CountIntegersInIntervals() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <SegtreeView {...step.seg} />
    <output aria-label="Covered count">{`Covered integers: ${step.count ?? 0}`}</output>
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Each node stores how many integers under it are covered. A fully covered node takes the length of its range without going deeper.</p>
    <p>The root holds the whole count, so a count query is a single read.</p>
  </>} />
}
