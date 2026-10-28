import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Pairs', description: 'Build the related-pairs graph.' },
    { id: 'group', label: 'Find related', description: 'Find values related to every other value in a group.' },
    { id: 'chain', label: 'Chain', description: 'Stack the fully related values as a chain.' },
    { id: 'split', label: 'Split', description: 'Solve each unrelated part separately.' },
    { id: 'zero', label: 'No tree', description: 'A group with no fully related value cannot form a tree.' },
    { id: 'done', label: 'Complete', description: 'Report the number of ways, capped at two.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with pairs of values, each [x, y] with x less than y (JSON)',
  url: 'https://leetcode.com/problems/number-of-ways-to-reconstruct-a-tree/',
  complexity: 'O(p + n^2) time for p pairs and n values, since each level scans its group. The visualization caps input at 8 values.',
  examples: [
    { label: 'One way', input: '{"pairs":[[1,2],[2,3]]}' },
    { label: 'Two ways', input: '{"pairs":[[1,2],[2,3],[1,3]]}' },
  ],
}

export default function ReconstructTree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Pairs">{`Pairs: ${run.input.pairs.map(([x, y]) => `${x}-${y}`).join(', ')}`}</output>
    <section aria-label="Links built so far">
      <h3>Links built so far</h3>
      {step.links.length === 0 ? <p><em>No links yet.</em></p> : <ul>{step.links.map(([child, above]) => <li key={child}>{above === null ? `${child} is the root` : `${child} sits below ${above}`}</li>)}</ul>}
    </section>
    <output aria-label="Current group">{`Group: ${step.group.join(', ') || 'none'}. ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>In a rooted tree, a value related to every other value must lie on the path from the root, so those values form a chain at the top.</p>
    <p>Removing that chain leaves groups that are unrelated to one another, and each group is solved the same way. Two or more values in one chain means the chain could be ordered two ways.</p>
  </>} />
}
