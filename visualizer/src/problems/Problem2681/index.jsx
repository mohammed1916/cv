import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sort', label: 'Sort', description: 'Sort the strengths so each one is the strongest of the heroes before it.' },
    { id: 'add', label: 'Add power', description: 'Add x squared times the weighted sum of weaker heroes, plus x alone.' },
    { id: 'carry', label: 'Carry', description: 'Double the weighted sum and add the current strength for the next hero.' },
    { id: 'done', label: 'Complete', description: 'Report the total modulo 1000000007.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums (1 to 12 strengths from 1 to 1000)',
  url: 'https://leetcode.com/problems/power-of-heroes/',
  complexity: 'O(n log n) time for the sort, O(1) extra space for the running sums.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,1,4]}' },
    { label: 'Example 2', input: '{"nums":[1,1,1]}' },
  ],
}

export default function PowerOfHeroes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Strengths, sorted" length={run.sorted.length} valueAt={i => run.sorted[i]} active={step.at}
      roleAt={i => (i < step.at ? 'earlier' : '')} />
    <output aria-label="Running values">{`Total: ${step.total}. Carry: ${step.carry}.`}</output>
  </>} renderReasoning={() => <>
    <p>After sorting, a hero is the strongest in every group that contains it and only weaker heroes otherwise.</p>
    <p>The carry is the weighted sum of earlier strengths, where each earlier hero contributes once for each group that includes it.</p>
  </>} />
}
