import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DispatchView from './DispatchView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with demand (1 to 8 cars here) and fuel (two amounts)',
  url: 'https://leetcode.com/problems/minimum-possible-maximum-waiting-time/',
  complexity: 'O(n × F × D) time and space, where n is the number of cars, F the fuel values of one dispenser and D the largest demand: the other dispenser’s fuel follows from the total used, and one busy time always equals the last demand. The official length is up to 50 cars; the visualization caps demand at 8.',
  examples: [
    { label: 'Fuel forces a wait', input: '{"demand":[7,3,5,4],"fuel":[12,7]}' },
    { label: 'Second car stuck', input: '{"demand":[5,9,2],"fuel":[6,6]}' },
    { label: 'First car stuck', input: '{"demand":[9,1],"fuel":[4,7]}' },
    { label: 'Plenty of fuel', input: '{"demand":[4,4,2],"fuel":[30,30]}' },
    { label: "Single car", input: '{"demand":[3],"fuel":[5,5]}' },
    { label: "Equal demands", input: '{"demand":[4,4,4],"fuel":[8,8]}' },
    { label: "Maximum fuel and demand", input: '{"demand":[20,20,20,20,20,20,20,20],"fuel":[50,50]}' },
    { label: "Long run: 8 cars", input: '{"demand":[16,19,17,2,5,4,8,10],"fuel":[40,1]}' },
  ],
}

export default function MinimumPossibleMaximumWaitingTime() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <DispatchView run={run} step={step} />} renderReasoning={() => <>
    <p>Each car has two choices, so listing every plan could take 2ⁿ steps. Many plans look identical to the cars still to come, though. Those cars only care about fuel left in each dispenser and how long each stays busy, counted from the moment the current car became allowed.</p>
    <p>So process one car at a time and keep each distinct state once, with the smallest longest wait that reaches it. A plan with a longer wait to the same state can never finish better, because the future is the same.</p>
    <p>Serving the most cars comes first, and the layers handle that without extra work. A layer exists only if some plan served that many cars, so the last non-empty layer holds exactly the plans that serve the most. Its smallest value is the answer.</p>
  </>} />
}
