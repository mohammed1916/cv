import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import OperationLog from '../../components/shared/OperationLog'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Begin processing votes in time order.' },
    { id: 'vote', label: 'Count vote', description: 'Add a vote and update the leader (ties favour the latest vote).' },
    { id: 'query', label: 'Query', description: 'Binary search the last vote time at or before t.' },
    { id: 'done', label: 'Complete', description: 'All queries answered.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object {persons, times, queries} (JSON)',
  url: 'https://leetcode.com/problems/online-election/',
  complexity: 'O(n) construction and O(log n) per query. Inputs are capped at 60 votes and 40 queries.',
  examples: [
    { label: 'Example 1', input: '{"persons":[0,1,1,0,0,1,0],"times":[0,5,10,15,20,25,30],"queries":[3,12,25,15,24,8]}' },
    { label: 'Tie goes to latest', input: '{"persons":[0,1,0,1],"times":[1,2,3,4],"queries":[1,2,3,4,10]}' },
  ],
}

export default function OnlineElection() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Vote times" length={run.input.times.length} active={step.vote} valueAt={i => run.input.times[i]} />
    <IndexedSequence label="Person voted for" length={run.input.persons.length} active={step.vote} valueAt={i => run.input.persons[i]} />
    <IndexedSequence label="Leader after each vote" length={step.leaders.length} active={step.vote} valueAt={i => step.leaders[i]} />
    <output aria-label="Vote counts">Counts: {Object.entries(step.counts).map(([p, c]) => `${p}: ${c}`).join(', ') || 'none'}</output>
    <OperationLog title="Queries q(t)" ops={run.input.queries.map((t, i) => ({ name: 'q', args: [t], returned: run.result[i] }))} current={step.qIndex ?? -1} through={step.qDone - 1} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The leader at time t depends only on votes cast up to t, so storing the leader after each vote turns every query into a search for the last vote time not exceeding t.</p>
  </>} />
}
