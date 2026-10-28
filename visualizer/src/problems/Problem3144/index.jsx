import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty prefix', description: 'The empty prefix needs zero pieces.' },
    { id: 'end', label: 'Prefix', description: 'Find the fewest pieces for the prefix ending here.' },
    { id: 'done', label: 'Complete', description: 'Report the fewest pieces for the whole string.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Lowercase string as a JSON string',
  url: 'https://leetcode.com/problems/minimum-substring-partition-of-equal-character-frequency/',
  complexity: 'O(n^3) with a direct balance check per piece. The visualization caps input at 16 characters.',
  examples: [
    { label: 'Example 1', input: '"fabccddg"' },
    { label: 'Example 2', input: '"abababaccddb"' },
  ],
}

export default function MinimumSubstringPartition() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const [from, to] = step.piece ?? [-1, -1]
    return <>
      <IndexedSequence label="String" length={run.input.length} valueAt={i => run.input[i]} active={step.end - 1} roleAt={i => (i >= from && i < to ? 'piece' : '')} />
      <output aria-label="Best pieces so far">{`Prefix length ${step.end}: ${Number.isFinite(step.best) ? step.best : 'unset'} pieces`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A partition is optimal for a prefix if its last piece is balanced and the part before that piece is optimal too.</p>
    <p>Single letters are always balanced, so every prefix can be reached and the table never stays unset.</p>
  </>} />
}
