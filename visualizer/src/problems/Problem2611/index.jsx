import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Order cheese types by the first mouse’s advantage.' },
    { id: 'first', label: 'First mouse', description: 'The first mouse takes this type while it has slots left.' },
    { id: 'second', label: 'Second mouse', description: 'The second mouse takes this type once the first mouse is full.' },
    { id: 'done', label: 'Complete', description: 'Report the total points.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with reward1, reward2 (equal-length arrays) and k',
  url: 'https://leetcode.com/problems/mice-and-cheese/',
  complexity: 'O(n log n) time for the sort and O(n) for the assignment. The visualization caps input at 12 cheese types.',
  examples: [
    { label: 'Five cheeses, k two', input: '{"reward1":[9,4,12,7,3],"reward2":[6,10,1,8,11],"k":2}' },
    { label: 'Example 2', input: '{"reward1":[1,1],"reward2":[3,4],"k":1}' },
    { label: 'Single cheese type, none chosen', input: '{"reward1":[7],"reward2":[2],"k":0}' },
    { label: 'Equal rewards tie', input: '{"reward1":[5,5],"reward2":[5,5],"k":1}' },
    { label: 'Alternating reward limits, all chosen', input: '{"reward1":[1000,1,1000,1,1000,1,1000,1,1000,1,1000,1],"reward2":[1,1000,1,1000,1,1000,1,1000,1,1000,1,1000],"k":12}' },
    { label: 'Long run: twelve types', input: '{"reward1":[703,366,657,264,899,562,357,476,327,46,809,280],"reward2":[228,71,998,345,384,987,18,189,892,447,630,857],"k":6}' },
  ],
}

export default function MiceAndCheese() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Cheese reward for each mouse" length={run.input.reward1.length} valueAt={i => `${run.input.reward1[i]} / ${run.input.reward2[i]}`} active={step.index} roleAt={i => step.assign[i] ? `${step.assign[i]} mouse` : ''} />
    <output aria-label="Running total">{`Total so far: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Each cheese type is worth reward1 to the first mouse and reward2 to the second. Only the difference matters once the total is fixed.</p>
    <p>The first mouse should take the k types where its advantage (reward1 minus reward2) is largest, so sorting by that gap is enough.</p>
  </>} />
}
