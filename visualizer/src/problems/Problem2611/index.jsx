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
    { label: 'Example 1', input: '{"reward1":[1,1,3,4],"reward2":[4,4,1,1],"k":2}' },
    { label: 'Example 2', input: '{"reward1":[1,1],"reward2":[3,4],"k":1}' },
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
