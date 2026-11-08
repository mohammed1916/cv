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
    { label: 'Single vote', input: '{"persons":[0],"times":[0],"queries":[0]}' },
    { label: 'Queries at the bounds', input: '{"persons":[1,0],"times":[0,1000000],"queries":[0,1000000,999999]}' },
    { label: 'Repeated query times', input: '{"persons":[2,1,2],"times":[3,7,9],"queries":[3,3,9,8]}' },
    { label: 'Long run: 60 votes, 40 queries', input: '{"persons":[2,5,1,5,2,3,0,4,3,1,3,5,5,2,3,1,3,2,3,0,0,3,4,4,3,0,5,4,0,1,5,3,0,1,2,2,3,0,0,2,2,0,2,5,4,5,2,5,3,5,0,5,1,5,2,2,5,5,1,2],"times":[11826,15446,16520,18964,33536,36017,51146,56887,62287,62429,63617,66691,67893,79234,92477,94482,100664,115302,122489,137953,139076,144249,156362,157303,171105,177458,192798,204566,215040,221162,224448,229113,229260,239292,252253,257467,265882,269993,280387,288878,292634,308123,310369,319982,331089,336652,346791,360934,364646,374371,379946,389982,390728,395211,408152,414145,422586,431493,441981,453942],"queries":[332517,358591,200308,304295,386795,49929,37610,71394,392787,186504,222682,169720,223712,176614,236588,33172,249797,18226,363513,133657,298609,54290,43629,183133,392973,410120,235321,232297,398370,329690,269124,70162,27733,37201,48299,79482,173580,302716,378250,271584]}' },
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
