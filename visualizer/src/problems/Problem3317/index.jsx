import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the total to zero.' },
    { id: 'term', label: 'Term', description: 'Add the ways when exactly j stages are used.' },
    { id: 'done', label: 'Complete', description: 'Report the total modulo 1e9+7.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n performers, x stages and y maximum score (JSON)',
  url: 'https://leetcode.com/problems/find-the-number-of-possible-ways-for-an-event/',
  complexity: 'O(n^2) time for the Stirling table. The visualization caps n at 8, x at 6 and y at 5.',
  examples: [
    { label: 'One performer', input: '{"n":1,"x":2,"y":3}' },
    { label: 'Five performers', input: '{"n":5,"x":2,"y":1}' },
  ],
}

export default function EventWays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Terms by number of used stages" length={run.terms.length}
      valueAt={i => run.terms[i].term} active={Math.max(0, step.j - 1)}
      roleAt={i => (i + 1 <= step.j ? 'added' : '')} />
    <output aria-label="Running total">{`Running total: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Performers are grouped by the stage they share. A group of performers that share a stage receives exactly one score.</p>
    <p>The number of ways to split n performers into j groups is a Stirling number, and the groups take distinct stages in P(x, j) ways.</p>
  </>} />
}
